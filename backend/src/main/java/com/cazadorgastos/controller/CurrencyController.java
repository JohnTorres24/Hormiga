package com.cazadorgastos.controller;

import com.cazadorgastos.model.ExchangeRate;
import com.cazadorgastos.service.CurrencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/currency")
public class CurrencyController {

    private final CurrencyService currencyService;

    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    @GetMapping("/rates")
    public ResponseEntity<Map<String, Object>> getRates() {
        List<ExchangeRate> rates = currencyService.getAllRates();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", rates.size(),
                "data", rates
        ));
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> sync() {
        Map<String, BigDecimal> synced = currencyService.syncRatesFromExternalApi();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tasas sincronizadas con la API oficial del dólar.",
                "rates", synced
        ));
    }

    @GetMapping("/convert")
    public ResponseEntity<Map<String, Object>> convert(
            @RequestParam BigDecimal amount,
            @RequestParam(defaultValue = "USD") String from,
            @RequestParam(defaultValue = "COP") String to) {

        Map<String, Object> result = currencyService.convert(amount, from, to);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
        ));
    }
}
