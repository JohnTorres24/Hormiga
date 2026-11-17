package com.cazadorgastos.service;

import com.cazadorgastos.model.NotificationLog;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class NotificationService {

    private final JdbcTemplate jdbcTemplate;

    public NotificationService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<NotificationLog> getUserAlerts(UUID userId) {
        String sql = """
            SELECT n.id, n.user_id, n.subscription_id, s.name AS subscription_name,
                   n.notification_type, n.scheduled_for, n.alert_lead_hours,
                   n.status, n.channel, n.title, n.message, n.sent_at, n.created_at
            FROM public.notification_logs n
            JOIN public.subscriptions s ON n.subscription_id = s.id
            WHERE n.user_id = ?
            ORDER BY n.scheduled_for ASC, n.created_at DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new NotificationLog(
                (UUID) rs.getObject("id"),
                (UUID) rs.getObject("user_id"),
                (UUID) rs.getObject("subscription_id"),
                rs.getString("subscription_name"),
                rs.getString("notification_type"),
                rs.getDate("scheduled_for").toLocalDate(),
                rs.getInt("alert_lead_hours"),
                rs.getString("status"),
                rs.getString("channel"),
                rs.getString("title"),
                rs.getString("message"),
                rs.getObject("sent_at", OffsetDateTime.class),
                rs.getObject("created_at", OffsetDateTime.class)
        ), userId);
    }

    public boolean dismissAlert(UUID alertId, UUID userId) {
        int updated = jdbcTemplate.update(
                "UPDATE public.notification_logs SET status = 'dismissed' WHERE id = ? AND user_id = ?",
                alertId, userId
        );
        return updated > 0;
    }

    /**
     * Tarea programada diaria a las 08:00 AM para escanear cobros a 48 horas.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void scheduledDailyScan() {
        System.out.println("[Scheduler Spring Boot - 08:00 AM] Ejecutando escaneo automático de cobros a 48 horas...");
        scanAndGeneratePreBillingAlerts();
    }

    public Map<String, Integer> scanAndGeneratePreBillingAlerts() {
        int trials = 0;
        int renewals = 0;

        // 1. Escaneo de pruebas gratuitas próximas a vencer (48 horas)
        String sqlTrials = """
            SELECT id, user_id, name, price, currency, trial_end_date
            FROM public.subscriptions
            WHERE is_free_trial = true 
              AND status = 'trial'
              AND trial_end_date IS NOT NULL
              AND trial_end_date >= CURRENT_DATE
              AND trial_end_date <= CURRENT_DATE + INTERVAL '2 days'
              AND id NOT IN (
                SELECT subscription_id FROM public.notification_logs 
                WHERE notification_type = 'trial_ending' 
                  AND scheduled_for = CURRENT_DATE
              )
        """;

        List<Map<String, Object>> trialRows = jdbcTemplate.queryForList(sqlTrials);
        for (Map<String, Object> r : trialRows) {
            UUID subId = (UUID) r.get("id");
            UUID userId = (UUID) r.get("user_id");
            String name = (String) r.get("name");
            Object price = r.get("price");
            String currency = (String) r.get("currency");
            Object endDate = r.get("trial_end_date");

            jdbcTemplate.update("""
                INSERT INTO public.notification_logs (
                    user_id, subscription_id, notification_type, scheduled_for,
                    alert_lead_hours, status, channel, title, message
                ) VALUES (?, ?, 'trial_ending', CURRENT_DATE, 48, 'pending', 'email', ?, ?)
            """,
                    userId, subId,
                    "¡Alerta de prueba gratuita! " + name + " vence en 48 horas",
                    "Tu periodo de prueba de " + name + " vencerá el " + endDate +
                    ". Después se te cobrará " + currency + " " + price + ". Cancélala ahora si no deseas continuar."
            );
            trials++;
        }

        // 2. Escaneo de renovaciones ordinarias a 48 horas
        String sqlRenewals = """
            SELECT id, user_id, name, price, currency, billing_cycle, next_billing_date
            FROM public.subscriptions
            WHERE status = 'active'
              AND next_billing_date >= CURRENT_DATE
              AND next_billing_date <= CURRENT_DATE + INTERVAL '2 days'
              AND id NOT IN (
                SELECT subscription_id FROM public.notification_logs 
                WHERE notification_type = 'renewal_upcoming' 
                  AND scheduled_for = CURRENT_DATE
              )
        """;

        List<Map<String, Object>> renewalRows = jdbcTemplate.queryForList(sqlRenewals);
        for (Map<String, Object> r : renewalRows) {
            UUID subId = (UUID) r.get("id");
            UUID userId = (UUID) r.get("user_id");
            String name = (String) r.get("name");
            Object price = r.get("price");
            String currency = (String) r.get("currency");
            String cycle = (String) r.get("billing_cycle");
            Object nextDate = r.get("next_billing_date");

            jdbcTemplate.update("""
                INSERT INTO public.notification_logs (
                    user_id, subscription_id, notification_type, scheduled_for,
                    alert_lead_hours, status, channel, title, message
                ) VALUES (?, ?, 'renewal_upcoming', CURRENT_DATE, 48, 'pending', 'email', ?, ?)
            """,
                    userId, subId,
                    "Aviso pre-cobro: " + name + " se renovará en 48 horas",
                    "Se procesará un cobro automático de " + currency + " " + price +
                    " por tu ciclo (" + cycle + ") el día " + nextDate + "."
            );
            renewals++;
        }

        return Map.of("trialsDetected", trials, "renewalsDetected", renewals);
    }
}
