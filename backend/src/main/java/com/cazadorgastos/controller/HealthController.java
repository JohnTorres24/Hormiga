package com.cazadorgastos.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "Cazador de Gastos Hormiga (Spring Boot - IntelliJ IDEA)",
                "timestamp", OffsetDateTime.now()
        ));
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "name", "Cazador de Gastos Hormiga - API Spring Boot",
                "ide", "IntelliJ IDEA Ready",
                "version", "1.0.0",
                "endpoints", Map.of(
                        "health", "/api/health",
                        "subscriptions", "/api/subscriptions",
                        "analytics_overview", "/api/analytics/overview",
                        "analytics_period", "/api/analytics/by-period",
                        "analytics_profitability", "/api/analytics/profitability",
                        "currency_rates", "/api/currency/rates",
                        "currency_convert", "/api/currency/convert?amount=10&from=USD&to=COP",
                        "cancellation_guides", "/api/cancellation-guides",
                        "notifications", "/api/notifications/alerts"
                )
        ));
    }
}
