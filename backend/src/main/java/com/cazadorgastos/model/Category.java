package com.cazadorgastos.model;

import java.util.UUID;

public record Category(
        UUID id,
        String name,
        String slug,
        String icon,
        String colorHex,
        String description
) {}
