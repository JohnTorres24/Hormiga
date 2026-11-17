package com.cazadorgastos.controller;

import com.cazadorgastos.dto.AnalyticsOverviewDto;
import com.cazadorgastos.dto.PeriodAnalysisDto;
import com.cazadorgastos.dto.ProfitabilityAnalysisDto;
import com.cazadorgastos.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private static final UUID DEFAULT_DEMO_USER = UUID.fromString("a0000000-0000-0000-0000-000000000001");

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    private UUID resolveUserId(UUID headerUserId) {
        return headerUserId != null ? headerUserId : DEFAULT_DEMO_USER;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview(
            @RequestHeader(value = "x-user-id", required = false) UUID headerUserId,
            @RequestParam(required = false) String currency) {

        UUID userId = resolveUserId(headerUserId);
        AnalyticsOverviewDto dto = analyticsService.getOverview(userId, currency);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", dto
        ));
    }

    @GetMapping("/by-period")
    public ResponseEntity<Map<String, Object>> getByPeriod(
            @RequestHeader(value = "x-user-id", required = false) UUID headerUserId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        UUID userId = resolveUserId(headerUserId);
        int targetYear = year != null ? year : LocalDate.now().getYear();
        int targetMonth = month != null ? month : LocalDate.now().getMonthValue();

        PeriodAnalysisDto dto = analyticsService.getByPeriod(userId, targetYear, targetMonth);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", dto
        ));
    }

    @GetMapping("/top-expenses")
    public ResponseEntity<Map<String, Object>> getTopExpenses(
            @RequestHeader(value = "x-user-id", required = false) UUID headerUserId,
            @RequestParam(defaultValue = "5") int limit) {

        UUID userId = resolveUserId(headerUserId);
        List<Map<String, Object>> top = analyticsService.getTopExpenses(userId, limit);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", top.size(),
                "data", top
        ));
    }

    @GetMapping("/profitability")
    public ResponseEntity<Map<String, Object>> getProfitability(
            @RequestHeader(value = "x-user-id", required = false) UUID headerUserId) {

        UUID userId = resolveUserId(headerUserId);
        ProfitabilityAnalysisDto dto = analyticsService.getProfitabilityAnalysis(userId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", dto
        ));
    }
}
