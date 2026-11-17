package com.cazadorgastos.service;

import com.cazadorgastos.model.CancellationGuide;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CancellationGuideService {

    private final JdbcTemplate jdbcTemplate;

    public CancellationGuideService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CancellationGuide> getAllGuides() {
        String sql = """
            SELECT id, service_name, provider_slug, category_slug, logo_url,
                   direct_cancellation_url, step_by_step_instructions::text AS instructions_json,
                   difficulty_level, estimated_time_minutes, cancellation_traps_warning
            FROM public.cancellation_guides
            ORDER BY service_name ASC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new CancellationGuide(
                (UUID) rs.getObject("id"),
                rs.getString("service_name"),
                rs.getString("provider_slug"),
                rs.getString("category_slug"),
                rs.getString("logo_url"),
                rs.getString("direct_cancellation_url"),
                rs.getString("instructions_json"),
                rs.getString("difficulty_level"),
                rs.getInt("estimated_time_minutes"),
                rs.getString("cancellation_traps_warning")
        ));
    }

    public CancellationGuide getGuideBySlug(String slug) {
        String sql = """
            SELECT id, service_name, provider_slug, category_slug, logo_url,
                   direct_cancellation_url, step_by_step_instructions::text AS instructions_json,
                   difficulty_level, estimated_time_minutes, cancellation_traps_warning
            FROM public.cancellation_guides
            WHERE provider_slug = ? OR LOWER(service_name) = LOWER(?)
            LIMIT 1
        """;

        List<CancellationGuide> list = jdbcTemplate.query(sql, (rs, rowNum) -> new CancellationGuide(
                (UUID) rs.getObject("id"),
                rs.getString("service_name"),
                rs.getString("provider_slug"),
                rs.getString("category_slug"),
                rs.getString("logo_url"),
                rs.getString("direct_cancellation_url"),
                rs.getString("instructions_json"),
                rs.getString("difficulty_level"),
                rs.getInt("estimated_time_minutes"),
                rs.getString("cancellation_traps_warning")
        ), slug, slug);

        return list.isEmpty() ? null : list.get(0);
    }
}
