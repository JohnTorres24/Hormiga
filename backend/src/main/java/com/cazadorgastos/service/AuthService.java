package com.cazadorgastos.service;

import com.cazadorgastos.dto.LoginRequest;
import com.cazadorgastos.dto.RegisterRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final JdbcTemplate jdbcTemplate;

    public AuthService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> register(RegisterRequest req) {
        if (req.email() == null || req.email().isBlank() || req.password() == null || req.password().length() < 6) {
            throw new IllegalArgumentException("El correo es requerido y la contraseña debe tener al menos 6 caracteres.");
        }

        String email = req.email().trim().toLowerCase();
        String fullName = req.fullName() != null && !req.fullName().isBlank() ? req.fullName().trim() : email.split("@")[0];
        String currency = req.preferredCurrency() != null && !req.preferredCurrency().isBlank() ? req.preferredCurrency().toUpperCase() : "COP";

        // Verificar si el usuario ya existe
        Integer count = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM auth.users WHERE LOWER(email) = ?",
                Integer.class,
                email
        );
        if (count != null && count > 0) {
            throw new IllegalArgumentException("Ya existe una cuenta registrada con el correo: " + email);
        }

        UUID userId = UUID.randomUUID();

        // 1. Insertar en auth.users con encriptación bcrypt de pgcrypto
        jdbcTemplate.update("""
            INSERT INTO auth.users (
                id, instance_id, aud, role, email, encrypted_password, 
                email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
                created_at, updated_at
            ) VALUES (
                ?,
                '00000000-0000-0000-0000-000000000000',
                'authenticated',
                'authenticated',
                ?,
                crypt(?, gen_salt('bf')),
                NOW(),
                '{"provider":"email","providers":["email"]}',
                ?,
                NOW(),
                NOW()
            )
        """,
                userId,
                email,
                req.password(),
                String.format("{\"full_name\":\"%s\",\"preferred_currency\":\"%s\"}", fullName, currency)
        );

        // 2. Asegurar registro en public.profiles
        jdbcTemplate.update("""
            INSERT INTO public.profiles (id, full_name, email, preferred_currency)
            VALUES (?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                preferred_currency = EXCLUDED.preferred_currency,
                updated_at = NOW()
        """, userId, fullName, email, currency);

        return Map.of(
                "id", userId.toString(),
                "fullName", fullName,
                "email", email,
                "preferredCurrency", currency
        );
    }

    public Map<String, Object> login(LoginRequest req) {
        if (req.email() == null || req.email().isBlank() || req.password() == null) {
            throw new IllegalArgumentException("Correo y contraseña son obligatorios.");
        }

        String email = req.email().trim().toLowerCase();

        // Verificar credenciales en auth.users
        String sql = """
            SELECT u.id, p.full_name, u.email, p.preferred_currency
            FROM auth.users u
            LEFT JOIN public.profiles p ON u.id = p.id
            WHERE LOWER(u.email) = ? 
              AND u.encrypted_password = crypt(?, u.encrypted_password)
            LIMIT 1
        """;

        List<Map<String, Object>> rows = jdbcTemplate.query(sql, (rs, rowNum) -> Map.of(
                "id", rs.getObject("id").toString(),
                "fullName", rs.getString("full_name") != null ? rs.getString("full_name") : email.split("@")[0],
                "email", rs.getString("email"),
                "preferredCurrency", rs.getString("preferred_currency") != null ? rs.getString("preferred_currency") : "COP"
        ), email, req.password());

        if (rows.isEmpty()) {
            throw new IllegalArgumentException("Credenciales inválidas. Verifica tu correo y contraseña.");
        }

        return rows.get(0);
    }
}
