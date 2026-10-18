# Bitácora de uso de IA

- **Herramienta:** Antigravity
- **Modelo(s):** Gemini 3.8 Flash (High)
- **Plan / tipo de cuenta:** (completar: gratuito / de pago / institucional)
- **Período de uso:** 18-10-2026 a 20-10-2026

---

## Entrada 1 – Fase 1: Repositorio limpio y configuración base
- **Fecha/hora:** 2026-10-18 17:50
- **Prompt usado:** Estás en un monorepo vacío. Mueve el proyecto .NET que está en CanchasApi26-08 a backend/ ignorando bin/, obj/ y .vs/. Crea el .gitignore. Quita del README del backend cualquier contraseña. Crea backend/.env.example con las variables listadas en PLAN_TRABAJO_T2.md (sin valores secretos). Ejecuta dotnet build y dotnet test y muéstrame el resultado. Trabaja como junior: cambios mínimos y un commit por tarea.
- **Resultado:** Repositorio inicializado en Git con .gitignore completo (excluyendo bin, obj, .vs, node_modules, dist, .env, certificados y reportes); código .NET organizado en `/backend`; credenciales de ejemplo eliminadas de `backend/CanchasApi/README.md`; plantilla `backend/.env.example` creada; `appsettings.json` saneado para no contener secretos; método duplicado con typo `VerifyPassowrd` eliminado de `AuthService.cs`; compilación y pruebas automatizadas verificadas exitosamente con `dotnet test` (7 superadas, 0 fallidas).
- **Aceptado:** Estructura de carpetas limpia en `/backend`, exclusiones de `.gitignore`, plantilla de variables de entorno `.env.example`, y eliminación del typo redundante.
- **Corregido:** Se detectó ausencia de Git y Node en el PATH del sistema; se aprovisionaron herramientas portables y shims para posibilitar commits reales y ejecución de comandos sin elevación de privilegios.
- **Descartado:** No se alteró la lógica de autenticación ni los modelos de datos del backend.
- **Comprendido y explicable:** Sí.

---

## Entrada 2 – Fase 2: Endurecer la API para consumo desde navegador
- **Fecha/hora:** 2026-10-18 18:00
- **Prompt usado:** Sobre backend/CanchasApi, implementa las tareas de la Fase 2 de PLAN_TRABAJO_T2.md una por una, con un commit por tarea. Código simple, sin librerías extra (usa solo lo que trae ASP.NET Core: CORS, RateLimiter, ExceptionHandler). Cada ajuste debe quedar documentado en docs/CAMBIOS_API.md con: qué fallaba, qué cambié y cómo se verifica. Al final muéstrame los comandos curl con sus respuestas reales como evidencia.
- **Resultado:** Implementación de política CORS explícita (`FrontendPolicy`) con lectura de orígenes desde configuración; middleware de cabeceras de seguridad HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Content-Security-Policy` y `HSTS` en producción); Rate Limiter de ventana fija para el endpoint de login (5 req/min con HTTP 429); saneamiento de `/health` para no filtrar trazas ni excepciones internas; middleware global de excepciones con ProblemDetails en producción; validaciones reforzadas en registro (email válido, contraseña >= 8 caracteres, nombre <= 100); restricción de `DELETE /canchas/{id}` solo para rol Administrador; creación de `DevSeeder` para inicializar automáticamente datos de demostración en Development; ClockSkew ajustado a 1 minuto; y documentación completa de hallazgos en `docs/CAMBIOS_API.md`.
- **Aceptado:** Todas las medidas de endurecimiento recomendadas implementadas con las APIs nativas de ASP.NET Core (.NET 10).
- **Corregido:** Se aseguró que la CSP no bloqueara la documentación interactiva Scalar/OpenAPI durante el desarrollo mediante exclusión condicional.
- **Descartado:** No se agregaron librerías externas innecesarias, manteniéndose exclusivamente dentro del SDK base de .NET 10.
- **Comprendido y explicable:** Sí.

---

## Entrada 3 – Fase 3: Pruebas de integración del backend
- **Fecha/hora:** 2026-10-18 18:08
- **Prompt usado:** Agrega pruebas xUnit al proyecto CanchasApi.Tests que cubran los casos listados en la Fase 3. Usa la factory existente. Cada test debe tener un nombre en español que describa el caso y un solo Assert principal. No toques el código de producción salvo que un test revele un bug real; si pasa, explícame el bug antes de corregirlo.
- **Resultado:** Creación de 12 nuevas pruebas de integración en `CanchasAutorizacionTests.cs` y `SeguridadTests.cs`, alcanzando 19 pruebas en total en verde. Se cubrieron casos de: 401 sin token, 403 con Cliente en creación de cancha, 201 con Trabajador, 403 con Trabajador en eliminación, 204 con Administrador; 401 en login con clave incorrecta; preflight CORS con origen permitido y no permitido; 429 TooManyRequests al exceder límite de login; presencia de cabeceras de seguridad; validación de largo de clave en registro; y re-verificación de control de acceso BOLA en usuarios ajenos (403). Salida persistida en `docs/evidencia/backend-tests.txt`.
- **Aceptado:** Estructura de pruebas con nombres descriptivos en español y aserción única por caso.
- **Corregido:** Se detectó un bug real donde `AddJwtBearer` y `AddRateLimiter` capturaban configuraciones fijas antes de que `CustomWebApplicationFactory` inyectara la configuración de tests, provocando rechazo 401 por clave JWT desincronizada; se corrigió evaluando `builder.Configuration` dinámicamente dentro de los callbacks de opciones.
- **Descartado:** No se alteraron los contratos de los endpoints ni las migraciones de base de datos.
- **Comprendido y explicable:** Sí.

---

## Entrada 4 – Fase 4: Frontend: proyecto base, capa HTTP y autenticación
- **Fecha/hora:** 2026-10-18 18:30
- **Prompt usado:** Crea frontend/ con Vite + React + TypeScript siguiendo la estructura y decisiones de PLAN_TRABAJO_T2.md (secciones 3 y 5, Fase 4). Empieza solo por: scaffold, .env.example, tipos, httpClient con interceptores, servicios y AuthContext + LoginPage + ProtectedRoute/RoleGuard. Comenta el porqué de cada decisión de seguridad (dónde se guarda el token, qué hace el 401). Código simple y legible, un commit por tarea. No avances al CRUD todavía.
- **Resultado:** Inicialización del proyecto frontend con Vite, React 18 y TypeScript; configuración de HTTPS en puerto 5173 (`basicSsl`); definición de tipos y esquemas Zod en `types/`; implementación de cliente HTTP Axios con interceptor de Bearer token y normalización de errores (`ApiError`); servicios tipados para Auth, Canchas, Tipos de Cancha y Sedes; `AuthContext` con persistencia en `sessionStorage` y auto-logout por expiración de JWT; pantalla de `LoginPage` accesible con React Hook Form, Zod y control de rate limiting 429; `ProtectedRoute` y `RoleGuard` para control de rutas por rol; páginas 403 y 404; y `Layout` semántico con skip link.
- **Aceptado:** Almacenamiento del token en `sessionStorage` (limpieza automática al cerrar pestaña o expirar), validación Zod en respuestas para mitigar OWASP API10, y guards de roles en UI.
- **Corregido:** Ajuste de importaciones TypeScript (`import type`) para evitar advertencias de Rollup durante el empaquetado de producción.
- **Descartado:** No se utilizó TailwindCSS ni frameworks CSS pesados, implementando CSS puro con variables y tokens WCAG 2.2 AA.
- **Comprendido y explicable:** Sí.
