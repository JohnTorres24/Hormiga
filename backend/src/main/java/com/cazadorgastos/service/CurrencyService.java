package com.cazadorgastos.service;

import com.cazadorgastos.model.ExchangeRate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CurrencyService {

    private final JdbcTemplate jdbcTemplate;
    private final RestTemplate restTemplate;

    @Value("${app.currency.api-url}")
    private String exchangeApiUrl;

    private final Map<String, BigDecimal> cache = new ConcurrentHashMap<>();
    private long lastCacheUpdate = 0;
    private static final long CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

    public CurrencyService(JdbcTemplate jdbcTemplate, RestTemplate restTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.restTemplate = restTemplate;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            syncRatesFromExternalApi();
        } catch (Exception e) {
            System.err.println("[CurrencyService] Error en sincronización inicial: " + e.getMessage());
        }
    }

    public BigDecimal getExchangeRate(String base, String target) {
        String baseUpper = base.toUpperCase();
        String targetUpper = target.toUpperCase();

        if (baseUpper.equals(targetUpper)) {
            return BigDecimal.ONE;
        }

        // 1. Revisar caché en memoria (máximo 1 hora)
        if (System.currentTimeMillis() - lastCacheUpdate < CACHE_TTL_MS && cache.containsKey(targetUpper)) {
            return cache.get(targetUpper);
        }

        // 2. Si la caché expiró o no tiene la tasa, sincronizar con la API en tiempo real
        syncRatesFromExternalApi();
        if (cache.containsKey(targetUpper)) {
            return cache.get(targetUpper);
        }

        // 3. Revisar base de datos Supabase como respaldo
        try {
            List<BigDecimal> rates = jdbcTemplate.query(
                    "SELECT rate FROM public.exchange_rates WHERE base_currency = ? AND target_currency = ? LIMIT 1",
                    (rs, rowNum) -> rs.getBigDecimal("rate"),
                    baseUpper, targetUpper
            );
            if (!rates.isEmpty()) {
                return rates.get(0);
            }
        } catch (Exception e) {
            System.err.println("[CurrencyService] Error al leer tasas de Supabase: " + e.getMessage());
        }

        return BigDecimal.valueOf(3320.19);
    }

    public Map<String, Object> convert(BigDecimal amount, String from, String to) {
        String fromUpper = from.toUpperCase();
        String toUpper = to.toUpperCase();

        if (fromUpper.equals(toUpper)) {
            return Map.of(
                    "originalAmount", amount,
                    "fromCurrency", fromUpper,
                    "toCurrency", toUpper,
                    "rate", BigDecimal.ONE,
                    "convertedAmount", amount
            );
        }

        BigDecimal rate;
        BigDecimal converted;

        if (fromUpper.equals("USD")) {
            rate = getExchangeRate("USD", toUpper);
            converted = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        } else if (toUpper.equals("USD")) {
            BigDecimal rateFromUSD = getExchangeRate("USD", fromUpper);
            rate = rateFromUSD.compareTo(BigDecimal.ZERO) > 0
                    ? BigDecimal.ONE.divide(rateFromUSD, 6, RoundingMode.HALF_UP)
                    : BigDecimal.ONE;
            converted = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        } else {
            // Triangulación cruzada vía USD
            BigDecimal rateFromUSD = getExchangeRate("USD", fromUpper);
            BigDecimal rateToUSD = getExchangeRate("USD", toUpper);
            rate = rateToUSD.divide(rateFromUSD.compareTo(BigDecimal.ZERO) > 0 ? rateFromUSD : BigDecimal.ONE, 6, RoundingMode.HALF_UP);
            converted = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        }

        return Map.of(
                "originalAmount", amount,
                "fromCurrency", fromUpper,
                "toCurrency", toUpper,
                "rate", rate,
                "convertedAmount", converted
        );
    }

    public synchronized Map<String, BigDecimal> syncRatesFromExternalApi() {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(exchangeApiUrl, Map.class);
            if (response != null && response.containsKey("rates")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> ratesMap = (Map<String, Object>) response.get("rates");
                String base = (String) response.getOrDefault("base_code", "USD");

                List<String> monitored = List.of("COP", "USD", "MXN", "EUR", "BRL", "CLP", "ARS", "PEN");

                for (String curr : monitored) {
                    if (ratesMap.containsKey(curr)) {
                        Object val = ratesMap.get(curr);
                        BigDecimal bVal = new BigDecimal(val.toString());
                        cache.put(curr, bVal);

                        jdbcTemplate.update(
                                """
                                INSERT INTO public.exchange_rates (base_currency, target_currency, rate, source, last_updated_at)
                                VALUES (?, ?, ?, 'open.er-api.com', NOW())
                                ON CONFLICT (base_currency, target_currency)
                                DO UPDATE SET rate = EXCLUDED.rate, last_updated_at = NOW()
                                """,
                                base, curr, bVal
                        );
                    }
                }
                lastCacheUpdate = System.currentTimeMillis();
                return cache;
            }
        } catch (Exception e) {
            System.err.println("[CurrencyService] Fallback de tasas ante error: " + e.getMessage());
            cache.put("USD", BigDecimal.ONE);
            cache.put("COP", BigDecimal.valueOf(4200.0));
            cache.put("MXN", BigDecimal.valueOf(19.8));
            cache.put("EUR", BigDecimal.valueOf(0.92));
        }
        return cache;
    }

    public List<ExchangeRate> getAllRates() {
        if (System.currentTimeMillis() - lastCacheUpdate > CACHE_TTL_MS) {
            syncRatesFromExternalApi();
        }
        return jdbcTemplate.query(
                "SELECT id, base_currency, target_currency, rate, source, last_updated_at FROM public.exchange_rates ORDER BY target_currency ASC",
                (rs, rowNum) -> new ExchangeRate(
                        (UUID) rs.getObject("id"),
                        rs.getString("base_currency"),
                        rs.getString("target_currency"),
                        rs.getBigDecimal("rate"),
                        rs.getString("source"),
                        rs.getObject("last_updated_at", OffsetDateTime.class)
                )
        );
    }
}
