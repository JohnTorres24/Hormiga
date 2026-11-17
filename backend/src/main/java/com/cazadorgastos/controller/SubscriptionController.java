package com.cazadorgastos.controller;

import com.cazadorgastos.dto.CreateSubscriptionRequest;
import com.cazadorgastos.dto.UpdateSubscriptionRequest;
import com.cazadorgastos.model.Subscription;
import com.cazadorgastos.service.SubscriptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private static final UUID DEFAULT_DEMO_USER = UUID.fromString("a0000000-0000-0000-0000-000000000001");

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    private UUID resolveUserId(UUID headerUserId) {
        return headerUserId != null ? headerUserId : DEFAULT_DEMO_USER;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSubscriptions(
            @RequestHeader(value = "x-user-id", required = false) UUID headerUserId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID categoryId) {

        UUID userId = resolveUserId(headerUserId);
        List<Subscription> list = subscriptionService.getUserSubscriptions(userId, status, categoryId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", list.size(),
                "data", list
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(
            @PathVariable UUID id,
            @RequestHeader(value = "x-user-id", required = false) UUID headerUserId) {

        UUID userId = resolveUserId(headerUserId);
        Subscription sub = subscriptionService.getSubscriptionById(id, userId);

        if (sub == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "Suscripción no encontrada."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", sub
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody CreateSubscriptionRequest req,
            @RequestHeader(value = "x-user-id", required = false) UUID headerUserId) {

        UUID userId = resolveUserId(headerUserId);
        UUID createdId = subscriptionService.createSubscription(userId, req);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Suscripción creada exitosamente.",
                "id", createdId
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable UUID id,
            @RequestBody UpdateSubscriptionRequest req,
            @RequestHeader(value = "x-user-id", required = false) UUID headerUserId) {

        UUID userId = resolveUserId(headerUserId);
        boolean updated = subscriptionService.updateSubscription(id, userId, req);

        if (!updated) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "Suscripción no encontrada o no modificada."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Suscripción actualizada exitosamente."
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(
            @PathVariable UUID id,
            @RequestHeader(value = "x-user-id", required = false) UUID headerUserId) {

        UUID userId = resolveUserId(headerUserId);
        boolean deleted = subscriptionService.deleteSubscription(id, userId);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "Suscripción no encontrada."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Suscripción eliminada satisfactoriamente."
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "x-user-id", required = false) UUID headerUserId) {

        UUID userId = resolveUserId(headerUserId);
        String status = body.get("status");

        if (status == null || !List.of("active", "paused", "cancelled", "trial").contains(status)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Estado inválido."
            ));
        }

        boolean ok = subscriptionService.updateStatus(id, userId, status);
        if (!ok) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "Suscripción no encontrada."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Estado actualizado a '" + status + "'."
        ));
    }
}
