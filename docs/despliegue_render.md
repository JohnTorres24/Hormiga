# Guía de Despliegue en Render: Servidor Backend API (Spring Boot / IntelliJ IDEA)
## Cazador de Gastos Hormiga («Gestor de Suscripciones»)

Esta guía explica el procedimiento formal para desplegar el servidor backend **Spring Boot (Java 21 con Maven)** en **Render**, conectado directamente a PostgreSQL en Supabase.

---

### 1. Métodos de Despliegue Admitidos en Render

1. **Despliegue Nativo Java / Maven (Recomendado):** Utilizando el manifiesto `render.yaml` incluido en la raíz del repositorio.
2. **Despliegue mediante Dockerfile:** Utilizando la imagen multi-etapa ubicada en `backend/Dockerfile`.

---

### 2. Parámetros de Configuración en el Dashboard de Render

Al crear un nuevo **Web Service** en Render ([dashboard.render.com](https://dashboard.render.com)):

| Parámetro | Valor de Configuración |
| :--- | :--- |
| **Name** | `cazador-gastos-hormiga-api` |
| **Region** | `Oregon (US West)` u `Ohio (US East)` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Java` (o `Docker`) |
| **Build Command** | `./mvnw clean package -DskipTests` |
| **Start Command** | `java -jar target/cazador-gastos-hormiga-1.0.0.jar` |
| **Plan Type** | `Free` (o `Starter`) |
| **Health Check Path** | `/api/health` |

---

### 3. Variables de Entorno Requeridas en Render

| Clave | Valor | Descripción |
| :--- | :--- | :--- |
| `PORT` | `10000` | Puerto predeterminado asignado por Render. |
| `DB_HOST` | `aws-1-us-east-1.pooler.supabase.com` | Host de conexión pooler de Supabase. |
| `DB_PORT` | `5432` | Puerto PostgreSQL de Supabase. |
| `DB_NAME` | `postgres` | Base de datos principal. |
| `DB_USER` | `postgres.nxlockddzloehrsrcyby` | Usuario de PostgreSQL en Supabase. |
| `DB_PASSWORD` | `0093215506Jhon` | Contraseña configurada. |
| `EXCHANGE_API_URL`| `https://open.er-api.com/v6/latest/USD` | API pública del valor del dólar. |
| `BASE_CURRENCY` | `USD` | Divisa base internacional. |
| `TARGET_DEFAULT_CURRENCY` | `COP` | Moneda preferida por defecto. |
| `PRE_BILLING_ALERT_HOURS` | `48` | Antelación en horas para alertas pre-cobro. |

---

### 4. Apertura y Ejecución Local en IntelliJ IDEA

1. Abra **IntelliJ IDEA**.
2. Seleccione **Open** y elija la carpeta `backend/` de este proyecto.
3. IntelliJ detectará automáticamente el archivo `pom.xml` y la carpeta `.idea/` preconfigurada con SDK Java 21.
4. En la esquina superior derecha, seleccione la configuración de ejecución preconfigurada **`CazadorGastosApplication`** y presione el botón verde de **Run** (o presione `Shift + F10`).
5. El servidor iniciará en `http://localhost:4000`.
