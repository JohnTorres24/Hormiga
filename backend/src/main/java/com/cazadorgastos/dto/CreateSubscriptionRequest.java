package com.cazadorgastos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateSubscriptionRequest(
        UUID categoryId,
        String name,
        String provider,
        String description,
        BigDecimal price,
        String currency,
        String billingCycle,
        String paymentMethod,
        LocalDate firstBillingDate,
        LocalDate nextBillingDate,
        Boolean isFreeTrial,
        LocalDate trialEndDate,
        String status,
        Boolean autoRenew,
        String cancellationUrl,
        UUID cancellationGuideId,
        String cancellationNotes,
        String usageFrequency,
        Integer perceivedValue
) {}
