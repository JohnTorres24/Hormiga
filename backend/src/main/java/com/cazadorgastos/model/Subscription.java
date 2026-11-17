package com.cazadorgastos.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record Subscription(
        UUID id,
        UUID userId,
        UUID categoryId,
        String categoryName,
        String categoryColor,
        String name,
        String provider,
        String description,
        BigDecimal price,
        String currency,
        String billingCycle,
        String paymentMethod,
        LocalDate firstBillingDate,
        LocalDate nextBillingDate,
        boolean isFreeTrial,
        LocalDate trialEndDate,
        String status,
        boolean autoRenew,
        String cancellationUrl,
        UUID cancellationGuideId,
        String cancellationNotes,
        String usageFrequency,
        int perceivedValue,
        BigDecimal normalizedMonthlyCost,
        BigDecimal normalizedYearlyCost,
        String profitabilityDiagnosis,
        Integer daysUntilNextBilling,
        Integer daysUntilTrialEnd
) {}
