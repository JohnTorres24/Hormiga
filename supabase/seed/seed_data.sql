-- ==============================================================================
-- SISTEMA: Cazador de Gastos Hormiga - Gestor de Suscripciones
-- DATOS SEMILLA (SEED DATA): Categorías, Tasas de Cambio Iniciales y Guías
-- CODIFICACIÓN: UTF-8 estricto
-- ==============================================================================

-- 1. POBLADO DE CATEGORÍAS
INSERT INTO public.categories (name, slug, icon, color_hex, description) VALUES
('Streaming de video', 'video-streaming', 'Film', '#E50914', 'Plataformas de series, películas y transmisiones en vivo (Netflix, Prime, Disney+).'),
('Música y podcasts', 'music-podcasts', 'Music', '#1DB954', 'Servicios de streaming musical y audio bajo demanda (Spotify, Apple Music, Deezer).'),
('Inteligencia artificial', 'artificial-intelligence', 'Bot', '#10A37F', 'Herramientas de IA generativa y modelos de lenguaje (ChatGPT Plus, Claude Pro, Midjourney).'),
('Almacenamiento en la nube', 'cloud-storage', 'Cloud', '#3B82F6', 'Respaldos de fotos, archivos y discos virtuales (iCloud, Google One, Dropbox).'),
('Productividad y software', 'productivity-software', 'Briefcase', '#8B5CF6', 'Suites ofimáticas, gestores de tareas y diseño (Notion, Microsoft 365, Canva, Figma).'),
('Salud, fitness y gimnasios', 'health-fitness', 'Activity', '#EF4444', 'Membresías de gimnasios, planes de entrenamiento y nutrición (Smart Fit, Strava, Fitbit).'),
('Videojuegos y ocio', 'gaming-entertainment', 'Gamepad2', '#F59E0B', 'Pases de juego, consolas y bibliotecas digitales (Xbox Game Pass, PlayStation Plus, Steam).'),
('Educación y aprendizaje', 'education-learning', 'GraduationCap', '#06B6D4', 'Cursos en línea, idiomas y plataformas educativas (Duolingo Super, Platzi, Coursera).'),
('Envíos y comercio electrónico', 'delivery-ecommerce', 'ShoppingBag', '#EC4899', 'Membresías de compras, delivery y envíos rápidos (Amazon Prime, RappiPrime, Mercado Libre).'),
('Otros servicios recurrentes', 'others', 'Layers', '#6B7280', 'Cualquier otro cobro recurrente o suscripción miscelánea.')
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    color_hex = EXCLUDED.color_hex,
    description = EXCLUDED.description;

-- 2. TASAS DE CAMBIO BASE INICIALES (USD como moneda base de referencia)
INSERT INTO public.exchange_rates (base_currency, target_currency, rate, source) VALUES
('USD', 'COP', 4200.0000, 'banco_de_la_republica'),
('USD', 'USD', 1.0000, 'base_fixed'),
('USD', 'MXN', 19.8000, 'banxico'),
('USD', 'EUR', 0.9250, 'ecb'),
('USD', 'BRL', 5.6500, 'bcb'),
('USD', 'CLP', 945.0000, 'bcentral')
ON CONFLICT (base_currency, target_currency) DO UPDATE
SET rate = EXCLUDED.rate,
    last_updated_at = TIMEZONE('utc', NOW());

-- 3. CATÁLOGO DE GUÍAS DE CANCELACIÓN RÁPIDA (Sin perder tiempo en menús ocultos)
INSERT INTO public.cancellation_guides (
    service_name,
    provider_slug,
    category_slug,
    logo_url,
    direct_cancellation_url,
    step_by_step_instructions,
    difficulty_level,
    estimated_time_minutes,
    cancellation_traps_warning
) VALUES
(
    'Netflix',
    'netflix',
    'video-streaming',
    'https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.ico',
    'https://www.netflix.com/youraccount',
    '[
        {"step": 1, "instruction": "Inicia sesión y abre directamente el enlace de tu cuenta."},
        {"step": 2, "instruction": "En la sección Membresía y facturación, haz clic en el botón Cancelar membresía."},
        {"step": 3, "instruction": "Confirma la cancelación en la pantalla final antes del siguiente ciclo."},
        {"step": 4, "instruction": "Revisa tu correo para verificar el mensaje formal de confirmación."}
    ]'::jsonb,
    'easy',
    2,
    'Netflix mantendrá el servicio activo hasta el último día del ciclo ya facturado; no cobran penalizaciones.'
),
(
    'Spotify',
    'spotify',
    'music-podcasts',
    'https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico',
    'https://www.spotify.com/account/overview/',
    '[
        {"step": 1, "instruction": "Accede a la página de vista general de tu cuenta de Spotify en el navegador."},
        {"step": 2, "instruction": "Desplázate hasta la sección Tu plan y pulsa en Cambiar plan."},
        {"step": 3, "instruction": "Baja hasta el apartado Cancelar Spotify y selecciona Cancelar Premium."},
        {"step": 4, "instruction": "Avanza por las pantallas de confirmación hasta ver el mensaje de confirmación final."}
    ]'::jsonb,
    'medium',
    3,
    'Spotify te mostrará ofertas y pantallas persuasivas para que te quedes; debes confirmar varias veces.'
),
(
    'ChatGPT Plus (OpenAI)',
    'chatgpt',
    'artificial-intelligence',
    'https://oaistatic-cdn.azureedge.net/favicon.ico',
    'https://chatgpt.com/#settings/Account',
    '[
        {"step": 1, "instruction": "En la esquina inferior izquierda de ChatGPT, haz clic en tu nombre o foto de perfil."},
        {"step": 2, "instruction": "Selecciona Configuración y dirígete a la pestaña Cuenta."},
        {"step": 3, "instruction": "Haz clic en Administrar suscripción."},
        {"step": 4, "instruction": "Serás redirigido al portal seguro de Stripe. Haz clic en Cancelar plan y confirma."}
    ]'::jsonb,
    'easy',
    2,
    'Tu acceso a GPT-4/o1 continuará hasta que termine el periodo de 30 días pagado.'
),
(
    'Amazon Prime',
    'amazon-prime',
    'delivery-ecommerce',
    'https://www.amazon.com/favicon.ico',
    'https://www.amazon.com/mc/manage',
    '[
        {"step": 1, "instruction": "Ingresa a la sección Administrar membresía Prime."},
        {"step": 2, "instruction": "Haz clic en Administrar membresía (menú desplegable en la barra superior)."},
        {"step": 3, "instruction": "Selecciona Finalizar membresía y beneficios."},
        {"step": 4, "instruction": "Haz clic en Continuar para cancelar a través de 3 pantallas consecutivas de retención."}
    ]'::jsonb,
    'hard',
    4,
    '¡Cuidado con el patrón oscuro! Amazon muestra botones en amarillo brillante para CONTINUAR con Prime y botones discretos en gris para cancelar.'
),
(
    'Apple Subscriptions (iCloud / Apple One)',
    'apple-services',
    'cloud-storage',
    'https://www.apple.com/favicon.ico',
    'https://support.apple.com/HT202039',
    '[
        {"step": 1, "instruction": "En tu iPhone o Mac, abre Ajustes / Preferencias del Sistema."},
        {"step": 2, "instruction": "Toca tu nombre (Apple Account / ID de Apple) en la parte superior."},
        {"step": 3, "instruction": "Toca en Suscripciones."},
        {"step": 4, "instruction": "Selecciona el servicio y pulsa Cancelar suscripción o Cancelar prueba gratuita."}
    ]'::jsonb,
    'easy',
    2,
    'Si cancelas una prueba gratuita de Apple, en muchos casos el acceso se corta inmediatamente en lugar de esperar al fin del periodo.'
),
(
    'Google One / YouTube Premium',
    'google-services',
    'cloud-storage',
    'https://www.google.com/favicon.ico',
    'https://play.google.com/store/account/subscriptions',
    '[
        {"step": 1, "instruction": "Abre el Centro de Suscripciones de Google Play Store en el navegador."},
        {"step": 2, "instruction": "Busca la suscripción activa que deseas finalizar."},
        {"step": 3, "instruction": "Haz clic en Administrar y posteriormente en Cancelar suscripción."},
        {"step": 4, "instruction": "Selecciona el motivo de cancelación y confirma la orden."}
    ]'::jsonb,
    'easy',
    2,
    'Google conserva tus archivos en Drive durante un periodo de gracia si reduces el plan por debajo de tu espacio usado.'
),
(
    'Adobe Creative Cloud',
    'adobe',
    'productivity-software',
    'https://www.adobe.com/favicon.ico',
    'https://account.adobe.com/plans',
    '[
        {"step": 1, "instruction": "Ingresa a tu cuenta de Adobe en el apartado Planes."},
        {"step": 2, "instruction": "En el plan contratado, pulsa Administrar plan."},
        {"step": 3, "instruction": "Selecciona Cancelar tu plan y especifica un motivo."},
        {"step": 4, "instruction": "Verifica si existe tarifa por cancelación anticipada antes de presionar el botón final."}
    ]'::jsonb,
    'hard',
    5,
    '¡Alerta de cobro oculto! Si contrataste el plan Anual pagado mensualmente, Adobe cobra una tarifa por cancelación anticipada del 50% de las mensualidades restantes.'
),
(
    'Disney+',
    'disney-plus',
    'video-streaming',
    'https://www.disneyplus.com/favicon.ico',
    'https://www.disneyplus.com/account',
    '[
        {"step": 1, "instruction": "Entra a disneyplus.com e inicia sesión con tu usuario."},
        {"step": 2, "instruction": "Haz clic en tu ícono de perfil y selecciona Cuenta."},
        {"step": 3, "instruction": "En Suscripción, haz clic en tu plan activo."},
        {"step": 4, "instruction": "Haz clic en Cancelar suscripción y completa la encuesta rápida para finalizar."}
    ]'::jsonb,
    'easy',
    2,
    'Si contrataste mediante Mercado Libre o un proveedor de telefonía, la cancelación debe tramitarse desde dicho intermediario.'
)
ON CONFLICT (provider_slug) DO UPDATE
SET service_name = EXCLUDED.service_name,
    category_slug = EXCLUDED.category_slug,
    logo_url = EXCLUDED.logo_url,
    direct_cancellation_url = EXCLUDED.direct_cancellation_url,
    step_by_step_instructions = EXCLUDED.step_by_step_instructions,
    difficulty_level = EXCLUDED.difficulty_level,
    estimated_time_minutes = EXCLUDED.estimated_time_minutes,
    cancellation_traps_warning = EXCLUDED.cancellation_traps_warning,
    updated_at = TIMEZONE('utc', NOW());
