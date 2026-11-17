package com.cazadorgastos.dto;

public record RegisterRequest(
        String fullName,
        String email,
        String password,
        String preferredCurrency
) {}
