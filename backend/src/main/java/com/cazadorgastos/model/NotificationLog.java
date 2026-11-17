package com.cazadorgastos.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationLog(
        UUID id,
        UUID userId,
        UUID subscriptionId,
        String subscriptionName,
        String notificationType,
        LocalDate scheduledFor,
        int alertLeadHours,
        String status,
        String channel,
        String title,
        String message,
        OffsetDateTime sentAt,
        OffsetDateTime createdAt
) {}
