package com.cazadorgastos.controller;

import com.cazadorgastos.model.CancellationGuide;
import com.cazadorgastos.service.CancellationGuideService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cancellation-guides")
public class CancellationGuideController {

    private final CancellationGuideService guideService;

    public CancellationGuideController(CancellationGuideService guideService) {
        this.guideService = guideService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<CancellationGuide> list = guideService.getAllGuides();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", list.size(),
                "data", list
        ));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Map<String, Object>> getBySlug(@PathVariable String slug) {
        CancellationGuide guide = guideService.getGuideBySlug(slug);
        if (guide == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "error", "Guía no encontrada para: " + slug
            ));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", guide
        ));
    }
}
