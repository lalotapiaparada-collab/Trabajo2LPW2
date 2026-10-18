# Matriz de Riesgos y Mitigaciones de Seguridad (OWASP)

**Proyecto:** CanchasYa – Trabajo 2 (LPW2)  
**Fecha:** 18-10-2026  
**Autores:** Equipo de Desarrollo (Estudiante LPW2) / Colaboración Antigravity  
**Alcance:** Monorepo CanchasYa (`frontend/` React 18 + TypeScript y `backend/` ASP.NET Core 10).  

---

## 1. Tabla Principal de Matriz de Riesgos

| Riesgo | Referencia OWASP | Lado | Dónde aparece (archivo y líneas reales) | Mitigación Implementada | Evidencia |
|:---|:---|:---|:---|:---|:---:|
| **Cross-Site Scripting (XSS)** | Top 10 web: Injection (A03:2021) | Cliente | `frontend/src/features/tipos-cancha/TiposCanchaPage.tsx`:218-223<br>`frontend/eslint.config.js`:24-26<br>`frontend/index.html`:11-15 | 1. Renderizado estrictamente como texto plano (`<p>{tipo.descripcion}</p>`).<br>2. Prohibición estricta de `dangerouslySetInnerHTML` con regla ESLint `react/no-danger: "error"`.<br>3. CSP con directiva `script-src 'self'`. | `04-xss-neutralizado.png`<br>`docs/evidencia/accesibilidad-wcag.md` |
| **Robo / Filtración de Token** | API2:2023 (Broken Authentication) | Cliente | `frontend/src/features/auth/AuthContext.tsx`:44-52, 95-100<br>`frontend/src/api/httpClient.ts`:19-33, 54-70 | 1. Token JWT persistido en `sessionStorage` (destrucción automática al cerrar pestaña).<br>2. Expulsión automática por cálculo de claim `exp`.<br>3. Interceptor Axios purga storage y redirige en HTTP 401.<br>4. Token nunca expuesto en URL ni `console.log`. | `docs/evidencia/frontend-tests.txt` (HttpClientInterceptor.test.tsx) |
| **Consumo Inseguro de Respuestas** | API10:2023 (Unsafe Consumption of APIs) | Cliente | `frontend/src/services/canchasService.ts`:8-10, 14-16<br>`frontend/src/services/tiposCanchaService.ts`:8-10, 14-16<br>`frontend/src/services/authService.ts`:8-10 | Validación en tiempo de ejecución con esquemas Zod (`safeParse` / `parse`) antes de renderizar. Si el backend retorna una estructura alterada o maliciosa, Zod falla controladamente. | `frontend/src/types/index.ts`<br>`docs/evidencia/frontend-tests.txt` |
| **Dependencias Vulnerables** | Top 10 web: Vulnerable Components (A06:2021) | Ambos | `frontend/package.json`:12-39<br>`backend/CanchasApi/CanchasApi.csproj`:10-20 | Auditorías periódicas con `npm audit` y `dotnet list package --vulnerable`. Justificación documentada de paquetes de desarrollo (`vite`, `esbuild`, `vitest`) y paquete transitivo PKCS. | `docs/evidencia/npm-audit.txt`<br>`docs/evidencia/dotnet-audit.txt` |
| **Control de Acceso a Nivel de Función** | API5:2023 (Broken Function Level Auth) | Ambos | `frontend/src/features/auth/RoleGuard.tsx`:14-22<br>`frontend/src/App.tsx`:46-52<br>`backend/CanchasApi/Endpoints/CanchaApi.cs`:31-45 | Doble barrera (Defensa en Profundidad):<br>1. En cliente: `RoleGuard` oculta rutas (`/canchas/nueva`, `/canchas/:id/editar`, `/tipos-cancha`) y botones a roles no autorizados.<br>2. En servidor: `[Authorize(Roles = "Administrador")]` y `RequireRole` rechazan peticiones con HTTP 403 Forbidden. | `02-403-rol-insuficiente.png`<br>`docs/evidencia/backend-tests.txt`<br>`docs/evidencia/frontend-tests.txt` |
| **Consumo sin Límites / Fuerza Bruta** | API4:2023 (Unrestricted Resource Consumption) | Ambos | `backend/CanchasApi/Program.cs`:42-56<br>`frontend/src/features/auth/LoginPage.tsx`:17-32, 130-142 | 1. Backend: Rate Limiting con Fixed Window Limiter (5 peticiones por minuto por IP) con HTTP 429 Too Many Requests.<br>2. Frontend: Captura del error 429 con temporizador visual regresivo de 60 segundos y deshabilitación interactiva de inputs y botón. | `05-rate-limit-429.png`<br>`docs/evidencia/backend-tests.txt`<br>`docs/evidencia/frontend-tests.txt` |
| **Configuración Insegura** | API8:2023 (Security Misconfiguration) | Ambos | `backend/CanchasApi/Program.cs`:20-40, 60-80<br>`backend/CanchasApi/Endpoints/HealthCheckApi.cs`:12-25<br>`frontend/vite.config.ts`:12-18 | 1. CORS explícito restringido a orígenes autorizados (`FrontendPolicy`).<br>2. Cabeceras HTTP: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `CSP`.<br>3. Endpoint `/health` y manejador global sanitizados con `ProblemDetails` genéricos (sin stack traces). | `03-cors-origen-bloqueado.png`<br>`06-cabeceras-seguridad.png`<br>`docs/CAMBIOS_API.md` |
| **Validación de Entradas e Inyección** | Top 10 web: Injection (A03:2021) | Ambos | `frontend/src/types/index.ts`:60-88<br>`backend/CanchasApi/Endpoints/UsuarioApi.cs`:25-40<br>`backend/CanchasApi/Services/CanchaService.cs`:20-50 | 1. Frontend: Validación de tipos y restricciones de negocio con React Hook Form + Zod (`CanchaFormSchema`, `TipoCanchaFormSchema`).<br>2. Backend: Validación obligatoria de email y longitud de contraseña (≥8 caracteres); consultas parametrizadas con EF Core contra SQL Injection. | `docs/evidencia/backend-tests.txt`<br>`docs/evidencia/frontend-tests.txt` |

---

## 2. Re-verificación de Riesgos Mitigados en Trabajo 1

Los siguientes riesgos abordados previamente fueron re-verificados con nuevas pruebas automatizadas en la Fase 3:
* **BOLA / IDOR (API1:2023):** Verificado en `backend/CanchasApi.Tests/SeguridadTests.cs` (`ObtenerUsuario_ConTokenDeOtroUsuario_Retorna403Forbidden`).
* **Broken Object Property Level Authorization (API3:2023):** Los DTOs de request aíslan los campos modificables impidiendo mass-assignment del rol `Administrador`.
* **Expiración de Tokens JWT:** Verificado con ClockSkew de 1 minuto y auto-logout en el cliente.
