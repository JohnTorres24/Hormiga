package com.cazadorgastos.dto;

public record LoginRequest(
        String email,
        String password
) {}
