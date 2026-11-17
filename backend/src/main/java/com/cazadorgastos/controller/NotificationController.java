package com.cazadorgastos.controller;

import com.cazadorgastos.model.NotificationLog;
import com.cazadorgastos.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private static final UUID DEFAULT_DEMO_USER = UUID.fromString("a0000000-0000-0000-0000-000000000001");

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private UUID resolveUserId(UUID headerUserId) {
        return headerUserId != null ? headerUserId : DEFAULT_DEMO_USER;
    }

    @GetMapping("/alerts")
    public ResponseEntity<Map<String, Object>> getAlerts(
            @RequestHeader(value = "x-user-id", required = false) UUID headerUserId) {

        UUID userId = resolveUserId(headerUserId);
        List<NotificationLog> alerts = notificationService.getUserAlerts(userId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", alerts.size(),
                "data", alerts
        ));
    }

    @PatchMapping("/alerts/{id}/dismiss")
    public ResponseEntity<Map<String, Object>> dismiss(
            @PathVariable UUID id,
            @RequestHeader(value = "x-user-id", required = false) UUID headerUserId) {

        UUID userId = resolveUserId(headerUserId);
        boolean ok = notificationService.dismissAlert(id, userId);

        if (!ok) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "Alerta no encontrada."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Alerta descartada."
        ));
    }

    @PostMapping("/scan")
    public ResponseEntity<Map<String, Object>> triggerScan() {
        Map<String, Integer> result = notificationService.scanAndGeneratePreBillingAlerts();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Escaneo de 48 horas ejecutado exitosamente.",
                "data", result
        ));
    }
}
