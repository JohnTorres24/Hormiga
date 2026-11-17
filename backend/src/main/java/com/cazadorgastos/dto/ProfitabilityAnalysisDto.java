package com.cazadorgastos.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ProfitabilityAnalysisDto(
        List<Map<String, Object>> mostProfitable,
        List<Map<String, Object>> leastProfitable,
        List<Map<String, Object>> ghostExpenses,
        BigDecimal annualGhostExpenseTotal,
        String currency
) {}
