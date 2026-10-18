# Matriz de Riesgos y Mitigaciones de Seguridad (OWASP)

**Proyecto:** CanchasYa – Trabajo 2 (LPW2)  
**Fecha:** 18-10-2026  
**Autores:** Equipo de Desarrollo / Colaboración Antigravity  

Esta matriz documenta los riesgos de seguridad identificados en el sistema (Frontend React y Backend ASP.NET Core), su correspondencia con los estándares **OWASP Top 10** y **OWASP API Security Top 10**, las medidas de mitigación técnicas implementadas en el código y el procedimiento para comprobarlas.

---

## 1. Matriz Resumen de Riesgos

| ID | Riesgo / Vector de Ataque | Clasificación OWASP | Componente / Dónde Aparece | Mitigación Implementada | Estado |
|:---|:---|:---|:---|:---|:---|
| **R-01** | Cross-Site Scripting (XSS) mediante inyección en campos de texto | **OWASP Top 10 A03:2021** (Injection) | Renderizado de descripciones y nombres en el frontend | Renderizado JSX como texto plano; regla ESLint `react/no-danger: "error"`; Content Security Policy (CSP). | **Mitigado** |
| **R-02** | Ataque de Fuerza Bruta / Agotamiento de Recursos en Login | **OWASP API4:2023** (Unrestricted Resource Consumption) / **A07:2021** | Endpoint `/api/v1/usuarios/login` | Rate Limiter de ventana fija en backend (5 req/min); bloqueo con temporizador regresivo de 60s en UI. | **Mitigado** |
| **R-03** | Consumo Inseguro de Respuestas de API (Schema Poisoning / Inyección) | **OWASP API10:2023** (Unsafe Consumption of APIs) | Servicios HTTP cliente en `frontend/src/services/` | Validación en tiempo de ejecución con esquemas Zod antes de renderizar. | **Mitigado** |
| **R-04** | Secuestro de Clics (Clickjacking) mediante iframes maliciosos | **OWASP Top 10 A05:2021** (Security Misconfiguration) | Vistas del Frontend en navegadores de clientes | Cabecera `X-Frame-Options: DENY`; CSP `frame-ancestors 'none'`. | **Mitigado** |
| **R-05** | Persistencia Excesiva o Fuga de Tokens de Autenticación | **OWASP Top 10 A07:2021** (Identification & Auth Failures) | Almacenamiento en cliente y cierre de sesión | Uso de `sessionStorage`; monitoreo activo del claim `exp` de JWT; limpieza en HTTP 401; token nunca en URL. | **Mitigado** |
| **R-06** | Exposición de Secretos en Bundles Públicos del Cliente | **OWASP Top 10 A01:2021** / **A05:2021** | Empaquetado Vite (`dist/`) y variables de entorno | `.env` en `.gitignore`; únicamente `VITE_API_URL` expuesta; backend usa `dotnet user-secrets`. | **Mitigado** |
| **R-07** | Dependencias y Componentes Vulnerables | **OWASP Top 10 A06:2021** (Vulnerable and Outdated Components) | Paquetes npm (`package-lock.json`) y paquetes NuGet | Auditorías `npm audit` y `dotnet list package --vulnerable`; justificación técnica de hallazgos transitivos. | **Mitigado** |
| **R-08** | Manipulación de Roles y Escalación de Privilegios en Cliente | **OWASP Top 10 A01:2021** (Broken Access Control) | Rutas y botones de administración en frontend | Doble control: `RoleGuard` en cliente (UI) + autorización obligatoria `[Authorize(Roles = ...)]` en backend. | **Mitigado** |

---

## 2. Detalle de Riesgos y Mitigaciones Técnicas

### R-01: Cross-Site Scripting (XSS)
- **Referencia OWASP:** A03:2021 – Injection.
- **Dónde aparece:** Formularios de creación y vistas de presentación de tipos de cancha (`TiposCanchaPage.tsx`) y canchas (`CanchaDetailPage.tsx`).
- **Mitigación:**
  1. React neutraliza inyecciones por defecto al escapar cadenas antes de insertarlas en el DOM.
  2. Se configuró la regla ESLint `react/no-danger: "error"` en `eslint.config.js` y `.oxlintrc.json` para bloquear el uso de `dangerouslySetInnerHTML`.
  3. Cabecera y meta etiqueta CSP (`Content-Security-Policy`) con directiva `script-src 'self'`.
- **Cómo se prueba:**
  1. Ingresar como Trabajador o Administrador a `/tipos-cancha`.
  2. Crear un tipo con descripción `<img src=x onerror=alert(1)>` o `<script>alert('xss')</script>`.
  3. Comprobar que en la tarjeta se visualiza el texto literal exacto y ninguna alerta de script se dispara.

---

### R-02: Fuerza Bruta en Autenticación
- **Referencia OWASP:** API4:2023 – Unrestricted Resource Consumption / A07:2021 – Auth Failures.
- **Dónde aparece:** Formulario de inicio de sesión (`LoginPage.tsx`) y endpoint `/api/v1/usuarios/login`.
- **Mitigación:**
  1. Backend: Middleware nativo de Rate Limiting con ventana fija de 1 minuto y máximo 5 solicitudes por IP. Retorna HTTP 429 Too Many Requests con cabecera `Retry-After`.
  2. Frontend: Interceptor captura HTTP 429 e inicia un temporizador regresivo de 60 segundos. Los inputs y el botón se deshabilitan mostrando `Espera Xs para reintentar`.
- **Cómo se prueba:**
  1. Intentar iniciar sesión 6 veces seguidas con contraseña incorrecta.
  2. En el sexto intento se recibe status 429 y la interfaz se bloquea mostrando el conteo regresivo.

---

### R-03: Consumo Inseguro de APIs (OWASP API10)
- **Referencia OWASP:** API10:2023 – Unsafe Consumption of APIs.
- **Dónde aparece:** Capa de servicios (`src/services/*.ts`) al recibir respuestas HTTP de la API externa.
- **Mitigación:**
  1. Cada endpoint valida la carga útil recibida contra un esquema Zod (`CanchaResponseSchema.parse()`, `TipoCanchaResponseSchema.parse()`, etc.).
  2. Si la API devolviera campos inesperados, tipos corruptos o estructuras inconsistentes, Zod levanta una excepción controlada evitando ataques de contaminación de prototipos o inyecciones silenciosas.
- **Cómo se prueba:**
  1. En las pruebas unitarias y de integración se valida que cargas malformadas son rechazadas inmediatamente por los servicios antes de propagarse a los componentes de interfaz.

---

### R-04: Clickjacking y Embebido No Autorizado
- **Referencia OWASP:** A05:2021 – Security Misconfiguration.
- **Dónde aparece:** Vistas del frontend al cargarse dentro de un `<iframe>` o `<frame>`.
- **Mitigación:**
  1. Servidor Vite y backend entregan la cabecera `X-Frame-Options: DENY`.
  2. Directiva CSP `frame-ancestors 'none'` configurada tanto en backend como en Vite.
- **Cómo se prueba:**
  1. Crear un archivo HTML con `<iframe src="https://localhost:5173"></iframe>`.
  2. El navegador impide la renderización del contenido dentro del iframe indicando violación de la política `X-Frame-Options`.

---

### R-05: Fuga y Persistencia Excesiva de Credenciales
- **Referencia OWASP:** A07:2021 – Identification and Authentication Failures.
- **Dónde aparece:** Manejo del token JWT y estado de autenticación (`AuthContext.tsx`, `httpClient.ts`).
- **Mitigación:**
  1. El token se guarda en `sessionStorage` (aislado por pestaña y destruido al cerrarse el navegador), evitando persistencia indefinida como ocurre en `localStorage`.
  2. `AuthContext` decodifica el token al inicio y programa un timer automático para invocar `logout()` cuando el claim `exp` expira.
  3. En caso de respuesta HTTP 401, el interceptor de Axios purga inmediatamente la sesión y redirige a `/login?expired=1`.
  4. Ningún token se imprime en `console.log` ni viaja en query params de la URL.
- **Cómo se prueba:**
  1. Iniciar sesión, cerrar la pestaña y abrir de nuevo la URL; el usuario debe volver a autenticarse.
  2. Inspeccionar la consola de desarrollador para confirmar ausencia de logs de credenciales.

---

### R-06: Exposición de Secretos
- **Referencia OWASP:** A01:2021 / A05:2021.
- **Dónde aparece:** Repositorio Git y artefactos compilados (`dist/`).
- **Mitigación:**
  1. Exclusiones en `.gitignore` para `.env`, `.env.local`, `.env.*.local`.
  2. Únicamente se exponen variables públicas que inician con `VITE_` (`VITE_API_URL`).
  3. El backend utiliza `dotnet user-secrets` en entorno local y no tiene contraseñas en `appsettings.json`.
- **Cómo se prueba:**
  1. Ejecutar `git status` y `git log` verificando que ningún archivo `.env` está versionado.
  2. Compilar con `npm run build` y buscar palabras clave de secretos (`secret`, `password`) en los bundles de `dist/assets/`.

---

### R-07: Vulnerabilidades en Dependencias de Terceros
- **Referencia OWASP:** A06:2021 – Vulnerable and Outdated Components.
- **Dónde aparece:** `package-lock.json` y dependencias de NuGet.
- **Mitigación y Justificación de Hallazgos:**
  1. **Frontend (`npm audit`):**
     * Hallazgos en `vitest`, `tinypool`, `esbuild` y `vite`: corresponden a dependencias exclusivas de desarrollo (`devDependencies`), las cuales no forman parte del bundle final de producción.
     * Hallazgo en `react-router`: relacionado con deshidratación en Server-Side Rendering (SSR). Nuestra aplicación es estrictamente una SPA del lado cliente sin renderizado en servidor ni deserialización remota de errores, por lo que no es vulnerable.
  2. **Backend (`dotnet list package --vulnerable`):**
     * Hallazgo en `System.Security.Cryptography.Pkcs 9.0.11`: paquete transitivo utilizado internamente por librerías criptográficas de .NET. No se procesan mensajes CMS/PKCS#7 en la API REST de canchas.
- **Cómo se prueba:**
  1. Ejecutar `npm audit` y revisar el reporte en `docs/evidencia/npm-audit.txt`.
  2. Ejecutar `dotnet list backend/CanchasApi/CanchasApi.csproj package --vulnerable` y revisar `docs/evidencia/dotnet-audit.txt`.

---

### R-08: Bypass de Autorización en Frontend
- **Referencia OWASP:** A01:2021 – Broken Access Control.
- **Dónde aparece:** Ocultamiento o manipulación de elementos en la interfaz de usuario.
- **Mitigación:**
  1. En el frontend, `RoleGuard.tsx` oculta rutas y botones no permitidos (por ejemplo, ocultar botón "Eliminar" a roles `Cliente` o `Trabajador`).
  2. **Principio de Defensa en Profundidad:** El frontend nunca confía en su propia seguridad visual. Cada petición crítica (`POST /canchas`, `PUT /canchas/{id}`, `DELETE /canchas/{id}`) es validada y autorizada de forma obligatoria por los endpoints de ASP.NET Core (`[Authorize(Roles = "Administrador")]`).
- **Cómo se prueba:**
  1. Intentar forzar una petición HTTP DELETE con token de `Trabajador` o `Cliente` (cubierto por las pruebas automatizadas `CanchasAutorizacionTests.cs` con respuestas 401 y 403).
