-- ==============================================================================
-- SISTEMA: Cazador de Gastos Hormiga - Gestor de Suscripciones y Cobros Recurrentes
-- MIGRACIÓN INICIAL: Esquema de Base de Datos PostgreSQL / Supabase
-- VERSIÓN: 1.0.0
-- CODIFICACIÓN: UTF-8 estricto
-- ==============================================================================

-- 1. HABILITACIÓN DE EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA: PROFILES (Perfiles de Usuario)
-- Vinculada de forma unívoca a auth.users de Supabase
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    preferred_currency VARCHAR(3) NOT NULL DEFAULT 'COP',
    alert_email BOOLEAN NOT NULL DEFAULT TRUE,
    alert_push BOOLEAN NOT NULL DEFAULT TRUE,
    alert_lead_days INTEGER NOT NULL DEFAULT 2, -- 2 días = 48 horas de antelación
    monthly_budget NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.profiles IS 'Perfil de usuario y configuración de preferencias y alertas.';

-- ==============================================================================
-- 3. TABLA: CATEGORIES (Categorías de Suscripciones)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL DEFAULT 'Folder',
    color_hex VARCHAR(7) NOT NULL DEFAULT '#6366F1',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.categories IS 'Categorías globales de servicios (Streaming, Productividad, Nube, etc.).';

-- ==============================================================================
-- 4. TABLA: EXCHANGE_RATES (Tasas de Cambio de Divisas)
-- Soporte multimoneda con actualización vía API externa (USD, COP, EUR, MXN, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    target_currency VARCHAR(3) NOT NULL,
    rate NUMERIC(14, 4) NOT NULL,
    source TEXT NOT NULL DEFAULT 'open-exchange-rates',
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_currency_pair UNIQUE (base_currency, target_currency)
);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.exchange_rates IS 'Tasas de conversión cambiaria frente al dólar (USD).';

-- ==============================================================================
-- 5. TABLA: SUBSCRIPTIONS (Suscripciones Activas y Recurrentes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('weekly', 'monthly', 'quarterly', 'biannual', 'yearly')),
    payment_method TEXT,
    
    -- Fechas de facturación y control
    first_billing_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_billing_date DATE NOT NULL,
    
    -- Control de periodo de prueba gratuito
    is_free_trial BOOLEAN NOT NULL DEFAULT FALSE,
    trial_end_date DATE,
    
    -- Estado de la suscripción
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'trial')),
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Guía y enlaces de cancelación
    cancellation_url TEXT,
    cancellation_guide_id UUID, -- Referencia opcional al catálogo de cancelación rápida
    cancellation_notes TEXT,
    
    -- Métricas de rentabilidad / utilidad subjetiva (Cazador de Gastos Hormiga)
    usage_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'rarely', 'never')),
    perceived_value INTEGER NOT NULL DEFAULT 3 CHECK (perceived_value BETWEEN 1 AND 5), -- 1: Pésima rentabilidad / Gasto fantasma, 5: Indispensable
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.subscriptions IS 'Registro principal de suscripciones contratadas por el usuario.';

-- ==============================================================================
-- 6. TABLA: PAYMENT_RECORDS (Historial de Pagos y Cobros Efectuados)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL,
    amount_in_preferred_currency NUMERIC(12, 2),
    exchange_rate_applied NUMERIC(14, 4) DEFAULT 1.0000,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'refunded', 'failed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.payment_records IS 'Historial cronológico de pagos para análisis mes a mes y año a año.';

-- ==============================================================================
-- 7. TABLA: CANCELLATION_GUIDES (Catálogo de Guías de Cancelación Rápida)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cancellation_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL UNIQUE,
    provider_slug TEXT NOT NULL UNIQUE,
    category_slug TEXT,
    logo_url TEXT,
    direct_cancellation_url TEXT NOT NULL,
    step_by_step_instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    difficulty_level TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    estimated_time_minutes INTEGER NOT NULL DEFAULT 2,
    cancellation_traps_warning TEXT, -- Advertencias sobre retención o pasos engañosos
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.cancellation_guides ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.cancellation_guides IS 'Catálogo paso a paso para cancelar servicios populares.';

-- ==============================================================================
-- 8. TABLA: NOTIFICATION_LOGS (Registro y Cola de Alertas Pre-Cobro)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('trial_ending', 'renewal_upcoming', 'price_change', 'ghost_expense_warning')),
    scheduled_for DATE NOT NULL,
    alert_lead_hours INTEGER NOT NULL DEFAULT 48, -- Alerta predeterminada de 48 horas
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed', 'failed')),
    channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'push', 'in_app')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.notification_logs IS 'Bitácora y cola de alertas 48 horas antes de cobros o renovaciones.';

-- ==============================================================================
-- 9. FUNCIONES AUXILIARES Y DISPARADORES (TRIGGERS)
-- ==============================================================================

-- Función para actualizar el campo updated_at de forma automática
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Disparador para perfiles
CREATE OR REPLACE TRIGGER tr_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Disparador para suscripciones
CREATE OR REPLACE TRIGGER tr_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Función automática para crear perfil al registrar usuario en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, preferred_currency)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'preferred_currency', 'COP')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador de vinculación de usuario Auth -> Profile
CREATE OR REPLACE TRIGGER tr_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para normalizar costo a mensual y anual
CREATE OR REPLACE FUNCTION public.calculate_normalized_costs(
    p_price NUMERIC,
    p_billing_cycle TEXT
)
RETURNS TABLE (monthly_cost NUMERIC, yearly_cost NUMERIC) AS $$
BEGIN
    CASE p_billing_cycle
        WHEN 'weekly' THEN
            monthly_cost := ROUND((p_price * 52) / 12, 2);
            yearly_cost  := ROUND(p_price * 52, 2);
        WHEN 'monthly' THEN
            monthly_cost := ROUND(p_price, 2);
            yearly_cost  := ROUND(p_price * 12, 2);
        WHEN 'quarterly' THEN
            monthly_cost := ROUND(p_price / 3, 2);
            yearly_cost  := ROUND(p_price * 4, 2);
        WHEN 'biannual' THEN
            monthly_cost := ROUND(p_price / 6, 2);
            yearly_cost  := ROUND(p_price * 2, 2);
        WHEN 'yearly' THEN
            monthly_cost := ROUND(p_price / 12, 2);
            yearly_cost  := ROUND(p_price, 2);
        ELSE
            monthly_cost := ROUND(p_price, 2);
            yearly_cost  := ROUND(p_price * 12, 2);
    END CASE;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ==============================================================================
-- 10. POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

-- Categorías: Visibles para todos los usuarios autenticados
CREATE POLICY "Categorías legibles por cualquier usuario autenticado"
ON public.categories FOR SELECT
TO authenticated
USING (true);

-- Tasas de cambio: Legibles por cualquier usuario autenticado
CREATE POLICY "Tasas de cambio legibles por cualquier usuario autenticado"
ON public.exchange_rates FOR SELECT
TO authenticated
USING (true);

-- Guías de cancelación: Legibles por cualquier usuario autenticado
CREATE POLICY "Guías de cancelación legibles por cualquier usuario autenticado"
ON public.cancellation_guides FOR SELECT
TO authenticated
USING (true);

-- Perfiles: Cada usuario gestiona exclusivamente su perfil
CREATE POLICY "Los usuarios pueden consultar su propio perfil"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Suscripciones: Aislamiento estricto por usuario
CREATE POLICY "Los usuarios pueden ver únicamente sus propias suscripciones"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias suscripciones"
ON public.subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden modificar sus propias suscripciones"
ON public.subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias suscripciones"
ON public.subscriptions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Historial de Pagos: Aislamiento por usuario
CREATE POLICY "Los usuarios pueden ver su propio historial de pagos"
ON public.payment_records FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden registrar pagos propios"
ON public.payment_records FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus pagos propios"
ON public.payment_records FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus registros de pago"
ON public.payment_records FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Alertas / Notificaciones: Aislamiento por usuario
CREATE POLICY "Los usuarios pueden ver sus propias notificaciones"
ON public.notification_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar el estado de sus notificaciones"
ON public.notification_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 11. VISTAS ANALÍTICAS PARA CONSULTAS FINANCIERAS
-- ==============================================================================

-- Vista 1: Métricas de Suscripciones Activas y Diagnóstico de Rentabilidad
CREATE OR REPLACE VIEW public.v_subscription_metrics AS
SELECT
    s.id AS subscription_id,
    s.user_id,
    s.name AS subscription_name,
    s.provider,
    s.category_id,
    c.name AS category_name,
    c.color_hex AS category_color,
    s.price,
    s.currency,
    s.billing_cycle,
    s.status,
    s.is_free_trial,
    s.trial_end_date,
    s.next_billing_date,
    s.usage_frequency,
    s.perceived_value,
    -- Normalización de costos calculados
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
    -- Clasificación de rentabilidad ("Cazador de Gastos Hormiga"):
    -- Si el valor percibido es bajo (1 o 2) y el uso es raro/nulo, se marca como Gasto Fantasma Crítico
    CASE
        WHEN s.status = 'active' AND s.perceived_value <= 2 AND s.usage_frequency IN ('rarely', 'never') THEN 'critico_gasto_hormiga'
        WHEN s.status = 'active' AND s.perceived_value <= 2 THEN 'baja_rentabilidad'
        WHEN s.status = 'active' AND s.perceived_value >= 4 THEN 'alta_rentabilidad'
        ELSE 'moderada'
    END AS profitability_diagnosis,
    -- Días restantes para el próximo cobro
    (s.next_billing_date - CURRENT_DATE) AS days_until_next_billing,
    -- Días restantes para fin de prueba gratuita (si aplica)
    CASE 
        WHEN s.is_free_trial AND s.trial_end_date IS NOT NULL THEN (s.trial_end_date - CURRENT_DATE)
        ELSE NULL
    END AS days_until_trial_end
FROM public.subscriptions s
LEFT JOIN public.categories c ON s.category_id = c.id;

-- Vista 2: Resumen Global por Usuario para el Dashboard Central
CREATE OR REPLACE VIEW public.v_user_financial_dashboard AS
SELECT
    p.id AS user_id,
    p.full_name,
    p.preferred_currency,
    COUNT(s.id) FILTER (WHERE s.status IN ('active', 'trial')) AS total_active_subscriptions,
    COUNT(s.id) FILTER (WHERE s.is_free_trial AND s.status = 'trial') AS active_free_trials,
    COALESCE(SUM(m.normalized_monthly_cost) FILTER (WHERE s.status IN ('active', 'trial')), 0) AS total_monthly_commitment,
    COALESCE(SUM(m.normalized_yearly_cost) FILTER (WHERE s.status IN ('active', 'trial')), 0) AS total_yearly_commitment,
    COUNT(s.id) FILTER (WHERE m.profitability_diagnosis = 'critico_gasto_hormiga') AS total_ghost_expenses,
    COALESCE(SUM(m.normalized_yearly_cost) FILTER (WHERE m.profitability_diagnosis = 'critico_gasto_hormiga'), 0) AS potential_annual_savings
FROM public.profiles p
LEFT JOIN public.subscriptions s ON p.id = s.user_id
LEFT JOIN public.v_subscription_metrics m ON s.id = m.subscription_id
GROUP BY p.id, p.full_name, p.preferred_currency;

-- Índices para optimización de consultas de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON public.subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_date ON public.payment_records(user_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_notification_logs_scheduled ON public.notification_logs(scheduled_for, status);
