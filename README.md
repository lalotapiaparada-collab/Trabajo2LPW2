# CanchasYa – Sistema de Gestión de Canchas Deportivas

**Trabajo 2 – Laboratorio de Programación Web 2 (LPW2)**  
Monorepo compuesto por un backend seguro en **ASP.NET Core (.NET 10.0)** y una aplicación web accesible en **React 18 + TypeScript + Vite**.

---

## 1. Requisitos Previos

* **.NET 10.0 SDK** (o superior).
* **Node.js 20.x** (LTS) o superior con `npm 10.x`.
* **Git**.
* Certificados de desarrollo HTTPS de confianza.

---

## 2. Puesta en Marcha Rápida (Clone & Run)

### Paso 1: Configurar Certificados HTTPS de Desarrollo
Ambos proyectos se ejecutan exclusivamente sobre **HTTPS** para cumplir con las directivas de seguridad y CSP:

```bash
# Confiar en el certificado de desarrollo de ASP.NET Core
dotnet dev-certs https --trust
```

### Paso 2: Configurar y Levantar el Backend (.NET 10)

```bash
cd backend/CanchasApi

# 1. Configurar clave secreta de JWT en el almacén de secretos local (sin versionar en Git)
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "ClaveSuperSecretaCanchasYa2026ParaTrabajo2LPW2!"
dotnet user-secrets set "Jwt:Issuer" "https://localhost:7269"
dotnet user-secrets set "Jwt:Audience" "https://localhost:5173"

# 2. Compilar e iniciar el servidor (Aplica migraciones y Seeder en Development automáticamente)
dotnet run --launch-profile https
```
* **Endpoint de la API:** `https://localhost:7269`
* **Health Check sanitizado:** `https://localhost:7269/health`

### Paso 3: Configurar y Levantar el Frontend (React + Vite)

En una terminal independiente:
```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Crear archivo .env desde la plantilla
cp .env.example .env

# 3. Iniciar el servidor de desarrollo Vite con HTTPS
npm run dev
```
* **Aplicación Web:** `https://localhost:5173`

---

## 3. Usuarios de Demostración (DevSeeder)

El backend incorpora un semillero de datos para desarrollo (`DevSeeder.cs`) que inicializa los siguientes perfiles de prueba:

| Rol | Correo Electrónico | Contraseña por Defecto | Permisos en el Sistema |
|:---|:---|:---|:---|
| **Administrador** | `admin@canchas.cl` | `Password123!` | Ver, crear, editar y eliminar canchas y tipos de cancha. |
| **Trabajador** | `trabajador@canchas.cl` | `Password123!` | Ver, crear y editar canchas y tipos de cancha (no puede eliminar). |
| **Cliente** | `cliente@canchas.cl` | `Password123!` | Solo lectura: consultar listado de canchas y ver detalle. |

> **Nota de Seguridad:** Las contraseñas se almacenan cifradas en la base de datos utilizando PBKDF2 (`Rfc2898DeriveBytes`) con sal única por usuario y 100.000 iteraciones.

---

## 4. Ejecución de Pruebas Automatizadas

### Pruebas de Integración del Backend (xUnit)
```bash
dotnet test backend/CanchasApi.slnx
```
* Ejecuta 19 pruebas de integración automáticas (`CanchasAutorizacionTests.cs` y `SeguridadTests.cs`) sobre una base de datos SQLite en memoria aislada.

### Pruebas Unitarias y de Componentes del Frontend (Vitest + MSW)
```bash
cd frontend
npm test
```
* Ejecuta 16 pruebas automatizadas sobre componentes accesibles, interceptor de sesión y flujos de autenticación.

### Linter de Seguridad y Accesibilidad
```bash
cd frontend
npm run lint
```
* Valida reglas de seguridad (prohibición de `dangerouslySetInnerHTML` vía `react/no-danger`) y reglas WCAG 2.2 AA (`eslint-plugin-jsx-a11y:recommended`).

### Pruebas End-to-End (Playwright)
```bash
cd frontend
# Con el backend y frontend levantados:
npm run test:e2e
```

---

## 5. Documentación del Proyecto

* **[docs/INFORME_TECNICO.md](docs/INFORME_TECNICO.md):** Arquitectura, justificación técnica del almacenamiento de token, análisis CSRF y decisiones de diseño.
* **[docs/MATRIZ_RIESGOS.md](docs/MATRIZ_RIESGOS.md):** Matriz de riesgos clasificados por OWASP Top 10 con referencias a archivos y líneas reales de código.
* **[docs/CAMBIOS_API.md](docs/CAMBIOS_API.md):** Endurecimiento aplicado a la API de ASP.NET Core (CORS, Rate Limiting, headers, filtros).
* **[docs/evidencia/accesibilidad-wcag.md](docs/evidencia/accesibilidad-wcag.md):** Informe de cumplimiento de accesibilidad WCAG 2.2 nivel AA.
* **[docs/EXPOSICION.md](docs/EXPOSICION.md):** Guion paso a paso de la demostración oral y respuestas a preguntas de defensa.
* **[AI_LOG.md](AI_LOG.md):** Bitácora transparente de uso de Inteligencia Artificial por fase de trabajo.