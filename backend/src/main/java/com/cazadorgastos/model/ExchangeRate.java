package com.cazadorgastos.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ExchangeRate(
        UUID id,
        String baseCurrency,
        String targetCurrency,
        BigDecimal rate,
        String source,
        OffsetDateTime lastUpdatedAt
) {}
