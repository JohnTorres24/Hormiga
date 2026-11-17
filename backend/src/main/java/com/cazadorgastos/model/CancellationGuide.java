package com.cazadorgastos.model;

import java.util.UUID;

public record CancellationGuide(
        UUID id,
        String serviceName,
        String providerSlug,
        String categorySlug,
        String logoUrl,
        String directCancellationUrl,
        String stepByStepInstructionsJson,
        String difficultyLevel,
        int estimatedTimeMinutes,
        String cancellationTrapsWarning
) {}
