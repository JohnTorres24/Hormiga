# Especificación Técnica de Arquitectura: Cazador de Gastos Hormiga

## 1. Visión General del Sistema
El sistema tiene como objetivo erradicar la fuga financiera involuntaria originada por suscripciones desatendidas, pruebas gratuitas no canceladas a tiempo y cobros recurrentes en divisas extranjeras (USD).

```
+-----------------------------------------------------------------------------------+
|                                 CLIENTES FINALES                                  |
|  +-------------------------------------+   +------------------------------------+  |
|  |     Aplicación Web (Vite + React)   |   |    App Móvil (React Native/Expo)   |  |
|  +-------------------------------------+   +------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        SERVIDOR BACKEND (Desplegado en Render)                     |
|  - API RESTful (Express / TypeScript)                                              |
|  - Conector a API de Divisas (Cotización USD en tiempo real)                       |
|  - Motor de Análisis Financiero (Gasto anualizado, valor más alto, rentabilidad)   |
|  - Tarea Programada (Cron 48h antes de corte/renovación)                           |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                     CAPA DE DATOS Y SEGURIDAD (Supabase / PostgreSQL)             |
|  - Autenticación con JWT (auth.users)                                             |
|  - Seguridad por Filas (Row Level Security - RLS)                                 |
|  - Vistas Analíticas (v_subscription_metrics, v_user_financial_dashboard)          |
|  - Catálogo de Guías de Cancelación Rápida                                        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Modelo Relacional de Base de Datos (Supabase)

### 2.1 Tablas Principales
1. **`profiles`**: Extiende la tabla nativa `auth.users` almacenando la divisa preferida (`COP`, `USD`, `MXN`, `EUR`), presupuesto mensual y parámetros de notificación (por defecto, alerta con 48 horas de antelación).
2. **`categories`**: Catálogo base para clasificar gastos recurrentes (Streaming de video, Música, Inteligencia artificial, Almacenamiento en la nube, Gimnasio, etc.).
3. **`exchange_rates`**: Registro de conversión de divisas con respecto al dólar estadounidense (USD). Permite convertir suscripciones internacionales a la moneda local del usuario.
4. **`subscriptions`**: Entidad central que almacena el nombre del servicio, proveedor, costo, ciclo de cobro, fecha de corte, indicador de periodo de prueba gratuito (`is_free_trial`), fecha de fin de prueba (`trial_end_date`), calificación de uso y valor percibido (1 a 5).
5. **`payment_records`**: Bitácora histórica de cobros ejecutados mes a mes con el tipo de cambio aplicado en la fecha correspondiente.
6. **`cancellation_guides`**: Repositorio de instrucciones paso a paso, enlaces directos a la sección de cancelación y advertencias de patrones oscuros (trampas de retención) de los servicios más populares.
7. **`notification_logs`**: Cola de notificaciones programadas y bitácora de mensajes enviados para evitar alertas duplicadas.

---

## 3. Lógica Analítica del "Cazador de Gastos Hormiga"

### 3.1 Normalización de Costos
Todas las suscripciones se proyectan a dos horizontes temporales estándar:
- **Costo mensual equivalente ($C_m$):**
  - Semanal: $C_m = \frac{\text{Precio} \times 52}{12}$
  - Mensual: $C_m = \text{Precio}$
  - Trimestral: $C_m = \frac{\text{Precio}}{3}$
  - Semestral: $C_m = \frac{\text{Precio}}{6}$
  - Anual: $C_m = \frac{\text{Precio}}{12}$

- **Costo anualizado total ($C_a$):**
  - Semanal: $C_a = \text{Precio} \times 52$
  - Mensual: $C_a = \text{Precio} \times 12$
  - Anual: $C_a = \text{Precio}$

### 3.2 Diagnóstico de Rentabilidad y "Gasto Hormiga Crítico"
Para responder a la necesidad de evaluar qué suscripción es la más rentable o si representa un gasto fantasma:
- **Calificación de valor percibido ($V_p$):** Escala de 1 a 5 (1 = Totalmente prescindible / casi nunca usada; 5 = Imprescindible para trabajo o vida diaria).
- **Frecuencia de uso ($F_u$):** `daily`, `weekly`, `monthly`, `rarely`, `never`.
- **Criterio de alerta roja:** Si $V_p \le 2$ y $F_u \in \{\text{'rarely'}, \text{'never'}\}$, el sistema clasifica automáticamente el registro como `critico_gasto_hormiga`, calculando el ahorro anual potencial inmediato si el usuario la cancela.

---

## 4. Estrategia de Alertas Pre-Cobro (Ventana de 48 Horas)
1. El backend ejecuta un proceso programado diario (*Cron Job*).
2. Filtra todas las suscripciones activas donde:
   $$\text{next\_billing\_date} - \text{CURRENT\_DATE} = 2 \text{ días (48 horas)}$$
   o donde:
   $$\text{is\_free\_trial} = \text{TRUE} \quad \land \quad \text{trial\_end\_date} - \text{CURRENT\_DATE} = 2 \text{ días}$$
3. Genera el registro correspondiente en `notification_logs` y despacha el correo o la notificación *push*, adjuntando la guía de cancelación directa si el usuario desea darse de baja antes de que el cobro automático se procese.
