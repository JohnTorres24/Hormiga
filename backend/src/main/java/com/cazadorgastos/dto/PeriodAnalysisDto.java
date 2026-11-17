package com.cazadorgastos.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record PeriodAnalysisDto(
        int year,
        int month,
        BigDecimal totalAmount,
        String currency,
        List<Map<String, Object>> chargesByDay,
        List<Map<String, Object>> categoryBreakdown
) {}
