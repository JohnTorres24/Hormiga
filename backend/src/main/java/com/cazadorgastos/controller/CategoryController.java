package com.cazadorgastos.controller;

import com.cazadorgastos.model.Category;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final JdbcTemplate jdbcTemplate;

    public CategoryController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCategories() {
        String sql = "SELECT id, name, slug, icon, color_hex, description FROM public.categories ORDER BY name ASC";
        List<Category> list = jdbcTemplate.query(sql, (rs, rowNum) -> new Category(
                (UUID) rs.getObject("id"),
                rs.getString("name"),
                rs.getString("slug"),
                rs.getString("icon"),
                rs.getString("color_hex"),
                rs.getString("description")
        ));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", list.size(),
                "data", list
        ));
    }
}
