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
