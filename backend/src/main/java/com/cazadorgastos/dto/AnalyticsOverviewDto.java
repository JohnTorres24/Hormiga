package com.cazadorgastos.dto;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record AnalyticsOverviewDto(
        UUID userId,
        String preferredCurrency,
        int totalActiveSubscriptions,
        int activeFreeTrials,
        BigDecimal totalMonthlyCommitment,
        BigDecimal totalYearlyCommitment,
        int totalGhostExpenses,
        BigDecimal potentialAnnualSavings,
        Map<String, Object> highestExpense
) {}
