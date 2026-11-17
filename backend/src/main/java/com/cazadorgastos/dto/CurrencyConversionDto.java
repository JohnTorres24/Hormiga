package com.cazadorgastos.dto;

import java.math.BigDecimal;

public record CurrencyConversionDto(
        BigDecimal originalAmount,
        String fromCurrency,
        String toCurrency,
        BigDecimal rate,
        BigDecimal convertedAmount
) {}
