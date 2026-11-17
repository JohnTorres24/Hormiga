# Cazador de Gastos Hormiga
## Gestor Inteligente de Suscripciones y Cobros Recurrentes

Sistema integral compuesto por:
1. **Base de Datos Relacional y Analítica**: PostgreSQL sobre **Supabase** con políticas RLS y vistas financieras.
2. **Servidor Backend**: API RESTful con TypeScript, Node.js y Express, lista para despliegue en **Render** con soporte de cron jobs y API del dólar.
3. **Plataforma Web**: Panel de control interactivo con métricas anualizadas, filtros mensuales/anuales y directorio de cancelación rápida.
4. **Aplicación Móvil**: Interfaz nativa para iOS y Android (React Native / Expo) con alertas 48 horas antes de cada cobro.

---

## Estructura del Repositorio

```text
├── docs/                         # Documentación técnica y diagramas de arquitectura
│   └── arquitectura_sistema.md   # Especificación de base de datos, flujos y endpoints
├── supabase/                     # Scripts y migraciones para Supabase
│   ├── migrations/               # Esquema DDL, funciones y políticas RLS
│   │   └── 20261116000000_initial_schema.sql
│   └── seed/                     # Datos iniciales (categorías, guías, tasas)
│       └── seed_data.sql
├── backend/                      # Servidor API para Render
├── frontend-web/                 # Aplicación web (Dashboard administrativo)
└── mobile-app/                   # Aplicación móvil (iOS / Android)
```

---

## Paso 1: Configuración de la Base de Datos en Supabase

### 1. Requisitos Previos
1. Una cuenta activa en [Supabase](https://supabase.com).
2. Crear un nuevo proyecto (por ejemplo: `cazador-gastos-hormiga`).
3. Guardar las siguientes credenciales del proyecto:
   - `Project URL`
   - `Anon Key` (clave pública del cliente)
   - `Service Role Key` (clave secreta del backend para tareas administrativas y cron)

### 2. Ejecución del Esquema en Supabase
1. Ingresa a tu proyecto en Supabase y dirígete al menú lateral **SQL Editor**.
2. Abre el archivo `supabase/migrations/20261116000000_initial_schema.sql` y copia su contenido completo.
3. Pega el código en el editor y presiona **Run**.
4. Posteriormente, abre el archivo `supabase/seed/seed_data.sql`, copia su contenido y ejecútalo para cargar las categorías, las tasas de cambio de referencia y las guías de cancelación rápida.
