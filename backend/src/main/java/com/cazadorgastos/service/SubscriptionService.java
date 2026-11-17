package com.cazadorgastos.service;

import com.cazadorgastos.dto.CreateSubscriptionRequest;
import com.cazadorgastos.dto.UpdateSubscriptionRequest;
import com.cazadorgastos.model.Subscription;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class SubscriptionService {

    private final JdbcTemplate jdbcTemplate;

    public SubscriptionService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Subscription> subscriptionRowMapper = (rs, rowNum) -> new Subscription(
            (UUID) rs.getObject("id"),
            (UUID) rs.getObject("user_id"),
            (UUID) rs.getObject("category_id"),
            rs.getString("category_name"),
            rs.getString("category_color"),
            rs.getString("name"),
            rs.getString("provider"),
            rs.getString("description"),
            rs.getBigDecimal("price"),
            rs.getString("currency"),
            rs.getString("billing_cycle"),
            rs.getString("payment_method"),
            rs.getDate("first_billing_date") != null ? rs.getDate("first_billing_date").toLocalDate() : null,
            rs.getDate("next_billing_date") != null ? rs.getDate("next_billing_date").toLocalDate() : null,
            rs.getBoolean("is_free_trial"),
            rs.getDate("trial_end_date") != null ? rs.getDate("trial_end_date").toLocalDate() : null,
            rs.getString("status"),
            rs.getBoolean("auto_renew"),
            rs.getString("cancellation_url"),
            (UUID) rs.getObject("cancellation_guide_id"),
            rs.getString("cancellation_notes"),
            rs.getString("usage_frequency"),
            rs.getInt("perceived_value"),
            rs.getBigDecimal("normalized_monthly_cost"),
            rs.getBigDecimal("normalized_yearly_cost"),
            rs.getString("profitability_diagnosis"),
            rs.getObject("days_until_next_billing") != null ? rs.getInt("days_until_next_billing") : null,
            rs.getObject("days_until_trial_end") != null ? rs.getInt("days_until_trial_end") : null
    );

    public List<Subscription> getUserSubscriptions(UUID userId, String status, UUID categoryId) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                s.id, s.user_id, s.category_id,
                c.name AS category_name, c.color_hex AS category_color,
                s.name, s.provider, s.description, s.price, s.currency,
                s.billing_cycle, s.payment_method, s.first_billing_date, s.next_billing_date,
                s.is_free_trial, s.trial_end_date, s.status, s.auto_renew,
                s.cancellation_url, s.cancellation_guide_id, s.cancellation_notes,
                s.usage_frequency, s.perceived_value,
                CASE s.billing_cycle
                    WHEN 'weekly' THEN ROUND((s.price * 52) / 12, 2)
                    WHEN 'monthly' THEN ROUND(s.price, 2)
                    WHEN 'quarterly' THEN ROUND(s.price / 3, 2)
                    WHEN 'biannual' THEN ROUND(s.price / 6, 2)
                    WHEN 'yearly' THEN ROUND(s.price / 12, 2)
                    ELSE ROUND(s.price, 2)
                END AS normalized_monthly_cost,
                CASE s.billing_cycle
                    WHEN 'weekly' THEN ROUND(s.price * 52, 2)
                    WHEN 'monthly' THEN ROUND(s.price * 12, 2)
                    WHEN 'quarterly' THEN ROUND(s.price * 4, 2)
                    WHEN 'biannual' THEN ROUND(s.price * 2, 2)
                    WHEN 'yearly' THEN ROUND(s.price, 2)
                    ELSE ROUND(s.price * 12, 2)
                END AS normalized_yearly_cost,
                CASE
                    WHEN s.status = 'active' AND s.perceived_value <= 2 AND s.usage_frequency IN ('rarely', 'never') THEN 'critico_gasto_hormiga'
                    WHEN s.status = 'active' AND s.perceived_value <= 2 THEN 'baja_rentabilidad'
                    WHEN s.status = 'active' AND s.perceived_value >= 4 THEN 'alta_rentabilidad'
                    ELSE 'moderada'
                END AS profitability_diagnosis,
                (s.next_billing_date - CURRENT_DATE) AS days_until_next_billing,
                CASE 
                    WHEN s.is_free_trial AND s.trial_end_date IS NOT NULL THEN (s.trial_end_date - CURRENT_DATE)
                    ELSE NULL
                END AS days_until_trial_end
            FROM public.subscriptions s
            LEFT JOIN public.categories c ON s.category_id = c.id
            WHERE s.user_id = ?
        """);

        List<Object> params = new ArrayList<>();
        params.add(userId);

        if (status != null && !status.isBlank()) {
            sql.append(" AND s.status = ?");
            params.add(status);
        }
        if (categoryId != null) {
            sql.append(" AND s.category_id = ?");
            params.add(categoryId);
        }

        sql.append(" ORDER BY s.next_billing_date ASC");

        return jdbcTemplate.query(sql.toString(), subscriptionRowMapper, params.toArray());
    }

    public Subscription getSubscriptionById(UUID id, UUID userId) {
        String sql = """
            SELECT 
                s.id, s.user_id, s.category_id,
                c.name AS category_name, c.color_hex AS category_color,
                s.name, s.provider, s.description, s.price, s.currency,
                s.billing_cycle, s.payment_method, s.first_billing_date, s.next_billing_date,
                s.is_free_trial, s.trial_end_date, s.status, s.auto_renew,
                s.cancellation_url, s.cancellation_guide_id, s.cancellation_notes,
                s.usage_frequency, s.perceived_value,
                ROUND(s.price, 2) AS normalized_monthly_cost,
                ROUND(s.price * 12, 2) AS normalized_yearly_cost,
                'moderada' AS profitability_diagnosis,
                (s.next_billing_date - CURRENT_DATE) AS days_until_next_billing,
                0 AS days_until_trial_end
            FROM public.subscriptions s
            LEFT JOIN public.categories c ON s.category_id = c.id
            WHERE s.id = ? AND s.user_id = ?
        """;
        List<Subscription> list = jdbcTemplate.query(sql, subscriptionRowMapper, id, userId);
        return list.isEmpty() ? null : list.get(0);
    }

    public UUID createSubscription(UUID userId, CreateSubscriptionRequest req) {
        UUID newId = UUID.randomUUID();
        jdbcTemplate.update("""
            INSERT INTO public.subscriptions (
                id, user_id, category_id, name, provider, description,
                price, currency, billing_cycle, payment_method,
                first_billing_date, next_billing_date,
                is_free_trial, trial_end_date, status, auto_renew,
                cancellation_url, cancellation_guide_id, cancellation_notes,
                usage_frequency, perceived_value
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, COALESCE(?, 'USD'), ?, ?,
                COALESCE(?, CURRENT_DATE), ?,
                COALESCE(?, false), ?, COALESCE(?, 'active'), COALESCE(?, true),
                ?, ?, ?,
                COALESCE(?, 'weekly'), COALESCE(?, 3)
            )
        """,
                newId,
                userId,
                req.categoryId(),
                req.name(),
                req.provider(),
                req.description(),
                req.price(),
                req.currency(),
                req.billingCycle(),
                req.paymentMethod(),
                req.firstBillingDate() != null ? Date.valueOf(req.firstBillingDate()) : null,
                Date.valueOf(req.nextBillingDate()),
                req.isFreeTrial(),
                req.trialEndDate() != null ? Date.valueOf(req.trialEndDate()) : null,
                req.status(),
                req.autoRenew(),
                req.cancellationUrl(),
                req.cancellationGuideId(),
                req.cancellationNotes(),
                req.usageFrequency(),
                req.perceivedValue()
        );
        return newId;
    }

    public boolean updateSubscription(UUID id, UUID userId, UpdateSubscriptionRequest req) {
        int updated = jdbcTemplate.update("""
            UPDATE public.subscriptions SET
                category_id = COALESCE(?, category_id),
                name = COALESCE(?, name),
                provider = COALESCE(?, provider),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                currency = COALESCE(?, currency),
                billing_cycle = COALESCE(?, billing_cycle),
                payment_method = COALESCE(?, payment_method),
                first_billing_date = COALESCE(?, first_billing_date),
                next_billing_date = COALESCE(?, next_billing_date),
                is_free_trial = COALESCE(?, is_free_trial),
                trial_end_date = COALESCE(?, trial_end_date),
                status = COALESCE(?, status),
                auto_renew = COALESCE(?, auto_renew),
                cancellation_url = COALESCE(?, cancellation_url),
                cancellation_guide_id = COALESCE(?, cancellation_guide_id),
                cancellation_notes = COALESCE(?, cancellation_notes),
                usage_frequency = COALESCE(?, usage_frequency),
                perceived_value = COALESCE(?, perceived_value),
                updated_at = NOW()
            WHERE id = ? AND user_id = ?
        """,
                req.categoryId(),
                req.name(),
                req.provider(),
                req.description(),
                req.price(),
                req.currency(),
                req.billingCycle(),
                req.paymentMethod(),
                req.firstBillingDate() != null ? Date.valueOf(req.firstBillingDate()) : null,
                req.nextBillingDate() != null ? Date.valueOf(req.nextBillingDate()) : null,
                req.isFreeTrial(),
                req.trialEndDate() != null ? Date.valueOf(req.trialEndDate()) : null,
                req.status(),
                req.autoRenew(),
                req.cancellationUrl(),
                req.cancellationGuideId(),
                req.cancellationNotes(),
                req.usageFrequency(),
                req.perceivedValue(),
                id,
                userId
        );
        return updated > 0;
    }

    public boolean deleteSubscription(UUID id, UUID userId) {
        int rows = jdbcTemplate.update("DELETE FROM public.subscriptions WHERE id = ? AND user_id = ?", id, userId);
        return rows > 0;
    }

    public boolean updateStatus(UUID id, UUID userId, String status) {
        int rows = jdbcTemplate.update(
                "UPDATE public.subscriptions SET status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?",
                status, id, userId
        );
        return rows > 0;
    }
}
