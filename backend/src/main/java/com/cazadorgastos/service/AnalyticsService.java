package com.cazadorgastos.service;

import com.cazadorgastos.dto.AnalyticsOverviewDto;
import com.cazadorgastos.dto.PeriodAnalysisDto;
import com.cazadorgastos.dto.ProfitabilityAnalysisDto;
import com.cazadorgastos.model.Subscription;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class AnalyticsService {

    private final JdbcTemplate jdbcTemplate;
    private final SubscriptionService subscriptionService;
    private final CurrencyService currencyService;

    public AnalyticsService(JdbcTemplate jdbcTemplate,
                            SubscriptionService subscriptionService,
                            CurrencyService currencyService) {
        this.jdbcTemplate = jdbcTemplate;
        this.subscriptionService = subscriptionService;
        this.currencyService = currencyService;
    }

    public String getUserPreferredCurrency(UUID userId) {
        List<String> list = jdbcTemplate.query(
                "SELECT preferred_currency FROM public.profiles WHERE id = ?",
                (rs, rowNum) -> rs.getString("preferred_currency"),
                userId
        );
        return list.isEmpty() ? "COP" : list.get(0);
    }

    public AnalyticsOverviewDto getOverview(UUID userId, String overrideCurrency) {
        String preferredCurrency = (overrideCurrency != null && !overrideCurrency.isBlank())
                ? overrideCurrency.toUpperCase()
                : getUserPreferredCurrency(userId);
        List<Subscription> subs = subscriptionService.getUserSubscriptions(userId, null, null);

        BigDecimal totalMonthly = BigDecimal.ZERO;
        BigDecimal totalYearly = BigDecimal.ZERO;
        int activeTrialsCount = 0;
        int ghostExpensesCount = 0;
        BigDecimal potentialSavings = BigDecimal.ZERO;

        Map<String, Object> highestExpense = null;
        BigDecimal maxMonthly = BigDecimal.valueOf(-1);

        for (Subscription s : subs) {
            if ("cancelled".equalsIgnoreCase(s.status()) || "paused".equalsIgnoreCase(s.status())) {
                continue;
            }

            if (s.isFreeTrial() && "trial".equalsIgnoreCase(s.status())) {
                activeTrialsCount++;
            }

            BigDecimal monthlyVal = s.normalizedMonthlyCost() != null ? s.normalizedMonthlyCost() : BigDecimal.ZERO;
            BigDecimal yearlyVal = s.normalizedYearlyCost() != null ? s.normalizedYearlyCost() : BigDecimal.ZERO;

            // Conversión monetaria a divisa de preferencia
            Map<String, Object> convM = currencyService.convert(monthlyVal, s.currency(), preferredCurrency);
            Map<String, Object> convY = currencyService.convert(yearlyVal, s.currency(), preferredCurrency);

            BigDecimal convMonthlyAmount = (BigDecimal) convM.get("convertedAmount");
            BigDecimal convYearlyAmount = (BigDecimal) convY.get("convertedAmount");

            totalMonthly = totalMonthly.add(convMonthlyAmount);
            totalYearly = totalYearly.add(convYearlyAmount);

            if (convMonthlyAmount.compareTo(maxMonthly) > 0) {
                maxMonthly = convMonthlyAmount;
                highestExpense = Map.of(
                        "id", s.id(),
                        "name", s.name(),
                        "provider", s.provider(),
                        "price", s.price(),
                        "currency", s.currency(),
                        "normalizedMonthlyCost", convMonthlyAmount,
                        "normalizedYearlyCost", convYearlyAmount
                );
            }

            if ("critico_gasto_hormiga".equalsIgnoreCase(s.profitabilityDiagnosis())) {
                ghostExpensesCount++;
                potentialSavings = potentialSavings.add(convYearlyAmount);
            }
        }

        return new AnalyticsOverviewDto(
                userId,
                preferredCurrency,
                subs.size(),
                activeTrialsCount,
                totalMonthly.setScale(2, RoundingMode.HALF_UP),
                totalYearly.setScale(2, RoundingMode.HALF_UP),
                ghostExpensesCount,
                potentialSavings.setScale(2, RoundingMode.HALF_UP),
                highestExpense
        );
    }

    public PeriodAnalysisDto getByPeriod(UUID userId, int year, int month) {
        String preferredCurrency = getUserPreferredCurrency(userId);
        List<Subscription> subs = subscriptionService.getUserSubscriptions(userId, null, null);

        List<Map<String, Object>> chargesByDay = new ArrayList<>();
        Map<String, Map<String, Object>> categoryMap = new HashMap<>();
        BigDecimal totalMonth = BigDecimal.ZERO;

        for (Subscription s : subs) {
            if ("cancelled".equalsIgnoreCase(s.status()) || "paused".equalsIgnoreCase(s.status())) {
                continue;
            }

            int billingDay = s.nextBillingDate() != null ? s.nextBillingDate().getDayOfMonth() : 1;
            Map<String, Object> conv = currencyService.convert(s.price(), s.currency(), preferredCurrency);
            BigDecimal convertedAmount = (BigDecimal) conv.get("convertedAmount");

            chargesByDay.add(Map.of(
                    "day", billingDay,
                    "subscriptionName", s.name(),
                    "amount", s.price(),
                    "currency", s.currency(),
                    "convertedAmount", convertedAmount,
                    "categoryName", s.categoryName() != null ? s.categoryName() : "General",
                    "categoryColor", s.categoryColor() != null ? s.categoryColor() : "#6B7280"
            ));

            totalMonth = totalMonth.add(convertedAmount);

            String catName = s.categoryName() != null ? s.categoryName() : "General";
            String catColor = s.categoryColor() != null ? s.categoryColor() : "#6B7280";

            if (!categoryMap.containsKey(catName)) {
                categoryMap.put(catName, new HashMap<>(Map.of("color", catColor, "total", BigDecimal.ZERO)));
            }
            BigDecimal currentTotal = (BigDecimal) categoryMap.get(catName).get("total");
            categoryMap.get(catName).put("total", currentTotal.add(convertedAmount));
        }

        // Ordenar por día de cobro
        chargesByDay.sort(Comparator.comparingInt(m -> (int) m.get("day")));

        List<Map<String, Object>> breakdown = new ArrayList<>();
        for (Map.Entry<String, Map<String, Object>> entry : categoryMap.entrySet()) {
            BigDecimal catTotal = (BigDecimal) entry.getValue().get("total");
            double pct = totalMonth.compareTo(BigDecimal.ZERO) > 0
                    ? catTotal.divide(totalMonth, 4, RoundingMode.HALF_UP).doubleValue() * 100
                    : 0.0;

            breakdown.add(Map.of(
                    "categoryName", entry.getKey(),
                    "categoryColor", entry.getValue().get("color"),
                    "totalAmount", catTotal.setScale(2, RoundingMode.HALF_UP),
                    "percentage", Math.round(pct * 10.0) / 10.0
            ));
        }

        return new PeriodAnalysisDto(
                year,
                month,
                totalMonth.setScale(2, RoundingMode.HALF_UP),
                preferredCurrency,
                chargesByDay,
                breakdown
        );
    }

    public List<Map<String, Object>> getTopExpenses(UUID userId, int limit) {
        String preferredCurrency = getUserPreferredCurrency(userId);
        List<Subscription> subs = subscriptionService.getUserSubscriptions(userId, null, null);

        List<Map<String, Object>> enriched = new ArrayList<>();
        for (Subscription s : subs) {
            if ("cancelled".equalsIgnoreCase(s.status())) continue;

            BigDecimal mVal = s.normalizedMonthlyCost() != null ? s.normalizedMonthlyCost() : s.price();
            BigDecimal yVal = s.normalizedYearlyCost() != null ? s.normalizedYearlyCost() : s.price().multiply(BigDecimal.valueOf(12));

            Map<String, Object> convM = currencyService.convert(mVal, s.currency(), preferredCurrency);
            Map<String, Object> convY = currencyService.convert(yVal, s.currency(), preferredCurrency);

            enriched.add(Map.of(
                    "id", s.id(),
                    "name", s.name(),
                    "provider", s.provider(),
                    "originalPrice", s.price(),
                    "originalCurrency", s.currency(),
                    "monthlyCostConverted", convM.get("convertedAmount"),
                    "yearlyCostConverted", convY.get("convertedAmount"),
                    "currency", preferredCurrency,
                    "profitabilityDiagnosis", s.profitabilityDiagnosis()
            ));
        }

        enriched.sort((a, b) -> ((BigDecimal) b.get("monthlyCostConverted")).compareTo((BigDecimal) a.get("monthlyCostConverted")));

        if (enriched.size() > limit) {
            return enriched.subList(0, limit);
        }
        return enriched;
    }

    public ProfitabilityAnalysisDto getProfitabilityAnalysis(UUID userId) {
        String preferredCurrency = getUserPreferredCurrency(userId);
        List<Subscription> subs = subscriptionService.getUserSubscriptions(userId, null, null);

        List<Map<String, Object>> mostProfitable = new ArrayList<>();
        List<Map<String, Object>> leastProfitable = new ArrayList<>();
        List<Map<String, Object>> ghostExpenses = new ArrayList<>();
        BigDecimal annualGhostTotal = BigDecimal.ZERO;

        for (Subscription s : subs) {
            if ("cancelled".equalsIgnoreCase(s.status())) continue;

            BigDecimal yVal = s.normalizedYearlyCost() != null ? s.normalizedYearlyCost() : s.price().multiply(BigDecimal.valueOf(12));
            Map<String, Object> convY = currencyService.convert(yVal, s.currency(), preferredCurrency);
            BigDecimal yearlyAmount = (BigDecimal) convY.get("convertedAmount");

            Map<String, Object> item = Map.of(
                    "id", s.id(),
                    "name", s.name(),
                    "provider", s.provider(),
                    "usageFrequency", s.usageFrequency(),
                    "perceivedValue", s.perceivedValue(),
                    "yearlyCostConverted", yearlyAmount,
                    "currency", preferredCurrency,
                    "diagnosis", s.profitabilityDiagnosis()
            );

            if ("alta_rentabilidad".equalsIgnoreCase(s.profitabilityDiagnosis())) {
                mostProfitable.add(item);
            } else if ("critico_gasto_hormiga".equalsIgnoreCase(s.profitabilityDiagnosis())) {
                ghostExpenses.add(item);
                annualGhostTotal = annualGhostTotal.add(yearlyAmount);
            } else {
                leastProfitable.add(item);
            }
        }

        return new ProfitabilityAnalysisDto(
                mostProfitable,
                leastProfitable,
                ghostExpenses,
                annualGhostTotal.setScale(2, RoundingMode.HALF_UP),
                preferredCurrency
        );
    }
}
