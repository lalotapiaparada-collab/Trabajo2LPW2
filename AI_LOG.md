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

---

## Entrada 5 – Fase 5: Frontend: CRUD de Canchas y Tipos de Cancha
- **Fecha/hora:** 2026-10-18 18:42
- **Prompt usado:** Implementa la Fase 5 del plan de trabajo: hooks de TanStack Query para canchas y tipos, listado con filtros reactivos (Sede, Tipo, Estado, Búsqueda texto) y paginación de 10 elementos, detalle de cancha con acciones según rol, modal nativo accesible para confirmación de borrado, toasts de notificación, formulario unificado para crear/editar cancha con validaciones Zod y mapeo de errores del backend, y gestión de tipos de cancha renderizando la descripción estrictamente como texto plano para evidenciar neutralización de XSS.
- **Resultado:** Implementación completa del módulo de canchas y tipos de cancha: hooks reactivos con `@tanstack/react-query` (`useCanchas`, `useCancha`, `useCrearCancha`, `useActualizarCancha`, `useEliminarCancha`, `useTiposCancha`, `useSedes`); vista de listado `CanchasListPage` con alternancia responsiva tabla/tarjetas (WCAG 1.4.10 reflow), filtros combinados, paginación cliente y visibilidad condicional según rol (`Cliente`, `Trabajador`, `Administrador`); modal de confirmación `ConfirmDialog` con `<dialog>` nativo y trampa de foco; componente `Toast` accesible (`role="status"`, `aria-live="polite"`); vista de detalle `CanchaDetailPage`; formulario `CanchaFormPage` (modo creación y edición unificados, selectores dinámicos, validación Zod y captura de errores 400/422); y vista `TiposCanchaPage` con formulario integrado y renderizado seguro contra XSS (`<p>{tipo.descripcion}</p>`).
- **Aceptado:** Estructura modular, uso de TanStack Query para invalidación y refresco de caché automático, accesibilidad completa con foco visible y textos descriptivos, y neutralización de XSS demostrada por diseño seguro en React.
- **Corregido:** Se aseguraron estilos CSS para todas las nuevas vistas (detalle, formulario y tarjetas de tipos de cancha) respetando variables y tokens de diseño accesibles.
- **Descartado:** No se utilizaron librerías complejas de UI ni manipulación insegura del DOM (`dangerouslySetInnerHTML`).
- **Comprendido y explicable:** Sí.

---

## Entrada 6 – Fase 6: Seguridad en el cliente
- **Fecha/hora:** 2026-10-18 18:55
- **Prompt usado:** Aplica la Fase 6 de PLAN_TRABAJO_T2.md: CSP, regla react/no-danger, manejo de 429, validación de respuestas con Zod y auditoría de dependencias. Para cada medida deja un comentario corto en el código y una nota en docs/MATRIZ_RIESGOS.md con: riesgo, referencia OWASP, dónde aparece, mitigación y cómo se prueba.
- **Resultado:** Implementación de medidas de seguridad en el cliente: regla ESLint `react/no-danger: "error"` configurada junto con `@typescript-eslint` y `eslint-plugin-react`; directivas de Content Security Policy (CSP) en `index.html` y cabeceras de servidor Vite con restricción de conexiones (`connect-src 'self' https://localhost:7269`) y protección contra clickjacking (`frame-ancestors 'none'`); manejo robusto de error HTTP 429 en `LoginPage.tsx` con temporizador regresivo de 60 segundos y bloqueo de interacción de formulario; reportes de auditoría de dependencias generados en `docs/evidencia/npm-audit.txt` y `docs/evidencia/dotnet-audit.txt`; y elaboración completa de `docs/MATRIZ_RIESGOS.md` cubriendo riesgos OWASP Top 10 y mitigaciones implementadas.
- **Aceptado:** Regla de ESLint no-danger, cabeceras CSP, contador regresivo en login 429 y justificación técnica documentada de vulnerabilidades en devDependencies.
- **Corregido:** Se configuró el parser de TypeScript en ESLint flat config para posibilitar el análisis estático de tipado y atributos JSX sin falsos positivos de sintaxis.
- **Descartado:** No se requirió alterar librerías productivas; no se usó `audit fix --force` indiscriminado que pudiera romper compatibilidad con React 18.
- **Comprendido y explicable:** Sí.

---

## Entrada 7 – Fase 7: Accesibilidad (WCAG 2.2 AA) y diseño responsivo
- **Fecha/hora:** 2026-10-18 19:05
- **Prompt usado:** Aplica la Fase 7 de PLAN_TRABAJO_T2.md sobre el frontend existente. Primero define los tokens de color/espaciado en src/styles/tokens.css y verifica el contraste. Luego corrige semántica, formularios, foco y diálogo. Después el responsivo mobile-first con tarjetas en móvil. Ejecuta eslint (jsx-a11y) y dime qué quedó pendiente; no declares cumplido nada que no hayas verificado.
- **Resultado:** Implementación y auditoría integral de accesibilidad WCAG 2.2 AA y responsividad: tokens de diseño en `tokens.css` con contrastes calculados entre 6.1:1 y 16.1:1 (todos superan el umbral 4.5:1); componente `RouteAccessibilityAnnouncer` que gestiona dinámicamente `document.title`, anuncia el cambio a lectores de pantalla y transfiere el foco al `<h1>` de cada vista; diálogo `<dialog>` con trampa de foco, cierre con `Escape` y retorno de foco al disparador; reglas recomendadas de `eslint-plugin-jsx-a11y` activas con 0 errores; botones e inputs con altura mínima táctil de 44 px; reflow responsivo a 320 px sin scroll horizontal con conmutación automática de tabla a tarjetas en móviles; y generación del informe detallado en `docs/evidencia/accesibilidad-wcag.md`.
- **Aceptado:** Foco visible estricto con anillo `:focus-visible` de 3px, landmarks HTML5 semánticos, skip link, anuncios de estado con `role="status"` y trampa de foco en modales nativos.
- **Corregido:** Se incorporó la clase `.sr-only` y prevención de `overflow-x: hidden` en `html, body` para garantizar navegación fluida en dispositivos móviles estrechos.
- **Descartado:** No se utilizaron trampas de foco permanentes ni hacks de accesibilidad basados en `div` con roles simulados.
- **Comprendido y explicable:** Sí.

---

## Entrada 8 – Fase 8: Pruebas automatizadas del frontend
- **Fecha/hora:** 2026-10-18 19:48
- **Prompt usado:** Escribe las pruebas de la Fase 8 de PLAN_TRABAJO_T2.md. Usa MSW para simular la API en las de componentes. Cada prueba debe describir el comportamiento en español y buscar elementos por rol/etiqueta (como lo haría un usuario), no por clases CSS. Luego crea el único test E2E en Playwright. Muéstrame la salida real de cada comando.
- **Resultado:** Configuración y ejecución exitosa de pruebas automatizadas en Vitest con Testing Library y MSW (Mock Service Worker), además de suite E2E en Playwright:
  1. Configuración de `vitest.config.ts`, `setupTests.ts` y servidor MSW con handlers para autenticación, canchas, sedes y tipos de cancha.
  2. Pruebas de `LoginPage` cubriendo validaciones de campos requeridos, mensaje accesible 401 por credenciales incorrectas, inicio de sesión exitoso con persistencia en `sessionStorage`, y bloqueo por rate limiting 429 con temporizador visual.
  3. Pruebas de `ProtectedRoute` y `RoleGuard` verificando redirección a `/login` para anónimos, acceso permitido para `Trabajador` y bloqueo 403 con redirección a `/acceso-denegado` para rol `Cliente`.
  4. Pruebas de `CanchasListPage` verificando indicador de carga, renderizado de datos en tabla/tarjetas, filtrado reactivo por texto y ocultamiento de controles de gestión para rol `Cliente`.
  5. Pruebas de `CanchaFormPage` verificando creación exitosa con Toast accesible y captura de errores de validación 400 del servidor.
  6. Pruebas de `HttpClientInterceptor` verificando purga de sesión en `sessionStorage` ante HTTP 401 e inyección de token Bearer en cabecera `Authorization`.
  7. Prueba E2E en Playwright (`flujo-canchas.spec.ts`) documentando el flujo de login como Trabajador, creación y visualización de cancha.
  8. 16/16 pruebas unitarias/componentes superadas con 0 fallos, salida guardada en `docs/evidencia/frontend-tests.txt`.
- **Aceptado:** Búsqueda accesible orientada al usuario mediante roles y etiquetas (`getByRole`, `getByLabelText`, `findByRole`), aislamiento de peticiones con MSW, y verificación de contratos de API.
- **Corregido:** Se identificó y resolvió un comportamiento de desbordamiento de entero de 32 bits en `setTimeout` dentro de `AuthContext.tsx` al decodificar timestamps lejanos en pruebas, limitando el delay a `MAX_TIMEOUT_MS` (2147483647 ms) para evitar auto-logouts prematuros.
- **Descartado:** No se utilizaron selectores frágiles por clases CSS ni llamadas directas al DOM privado de React.
- **Comprendido y explicable:** Sí.

---

## Entrada 9 – Fase 9: Evidencias, informe técnico y bitácora
- **Fecha/hora:** 2026-10-18 19:54
- **Prompt usado:** Con todo el código terminado, genera los documentos de la Fase 9: docs/MATRIZ_RIESGOS.md (usa la tabla propuesta y completa la columna "dónde aparece" con archivos y líneas reales), docs/INFORME_TECNICO.md, ambos README.md y la carpeta docs/evidencia/ con los reportes que se puedan generar por comandos. No inventes capturas: lista las que yo debo tomar manualmente y con qué pasos.
- **Resultado:** Elaboración de la suite completa de documentación técnica y evidencias:
  1. Actualización de `docs/MATRIZ_RIESGOS.md` referenciando archivos y líneas de código exactas de mitigación para 8 riesgos OWASP (XSS, robo de token, consumo inseguro API10, dependencias vulnerables, BFLA API5, rate limiting API4, configuración insegura API8, inyección).
  2. Redacción de `docs/INFORME_TECNICO.md` detallando arquitectura monolito/SPA, estado del servidor vs estado de cliente (TanStack Query + AuthContext), justificación de `sessionStorage` frente a cookies y `localStorage`, demostración de por qué CSRF no aplica a APIs con Bearer token, y resumen de accesibilidad WCAG 2.2 AA.
  3. Redacción de `README.md` (raíz) y `frontend/README.md` con instrucciones "Clone & Run" sin ajustes manuales, certificados HTTPS, user-secrets, DevSeeder y comandos de pruebas.
  4. Creación de `docs/evidencia/GUIA_CAPTURAS.md` con el instructivo paso a paso para la captura manual de evidencias (401, 403, CORS, XSS, 429, cabeceras, Lighthouse y resoluciones responsivas).
  5. Creación de `docs/evidencia/13-revision-teclado-lector.md` con lista de chequeo de navegación por teclado y lector de pantalla NVDA.
- **Aceptado:** Estructura modular, trazabilidad de código con enlaces de repositorio reales, documentación académica rigurosa y checklist de evidencias.
- **Corregido:** Se aseguraron rutas y comandos multiplataforma con explicaciones para PowerShell y bash en Windows.
- **Descartado:** No se incluyeron imágenes ficticias; se proveyó la guía explícita para la obtención de capturas reales.
- **Comprendido y explicable:** Sí.

---

## Entrada 10 – Fase 10: Exposición y preparación de defensa oral
- **Fecha/hora:** 2026-10-18 19:56
- **Prompt usado:** Crea docs/EXPOSICION.md con un guion paso a paso de la demo (sección Fase 10 del plan) y el contenido de 8-10 diapositivas en texto. Incluye, para cada paso de la demo, el comando o clic exacto y el resultado que debe verse. Agrega 10 preguntas probables del docente con respuestas cortas basadas en el código real del proyecto, indicando archivo y función donde se ve cada cosa.
- **Resultado:** Elaboración completa de la guía de exposición y defensa oral en `docs/EXPOSICION.md`:
  1. Estructura de 9 diapositivas cubriendo portada, arquitectura monorepo, manejo de estado cliente/servidor, matriz de riesgos OWASP, justificación técnica contra CSRF, modelo RBAC, accesibilidad WCAG 2.2 AA, estrategia de pruebas y conclusiones.
  2. Guion paso a paso cronometrado para una demostración en vivo de 10 a 12 minutos con comandos curl y clics exactos: arquitectura, login como Cliente, inspección de token Bearer y sessionStorage en DevTools, petición sin token (401), acceso con rol insuficiente (403), neutralización de XSS, bloqueo CORS, rate limit de login (429), navegación solo por teclado y responsive a 320 px, y verificación de pruebas en verde.
  3. Banco de 10 preguntas probables del docente con respuestas fundamentadas en archivos, líneas y funciones concretas del código fuente.
- **Aceptado:** Guion preciso y reproducible, respuestas técnicas vinculadas a la implementación real y cobertura completa de los requerimientos de evaluación.
- **Corregido:** Se adaptaron los comandos de terminal para compatibilidad tanto con PowerShell como con bash.
- **Descartado:** No se utilizaron explicaciones abstractas o genéricas no aplicables al código del repositorio.
- **Comprendido y explicable:** Sí.

---

## Entrada 11 – Resolución de sembrado de datos y credenciales de prueba (DevSeeder)
- **Fecha/hora:** 2026-10-18 20:30
- **Prompt usado:** Correo o contraseña incorrectos.
- **Resultado:** Diagnóstico de autenticación y corrección del seeder en `backend/CanchasApi/Services/DevSeeder.cs`:
  1. **Causa raíz:** La base de datos local SQL Server contenía un usuario residual de la entrega previa (`admin@canchas.cl` con rol `Cliente` y hash legado `ipvg2026`). Dado que `DevSeeder.cs` poseía una verificación de salida temprana (`if (await db.Usuarios.AnyAsync()) return;`), la presencia de dicho usuario omitía el sembrado de los roles `Trabajador` y `Cliente`, manteniendo además la contraseña antigua y el rol desactualizado.
  2. **Implementación:** Refactorización de `DevSeeder.cs` para operar bajo lógica **idempotente (upsert)**:
     - Normalización de la contraseña por defecto a `Password123!` (alineada con la documentación, los tests y las tarjetas de credenciales en el login del frontend).
     - Actualización o inserción garantizada de `admin@canchas.cl` con rol `Administrador`.
     - Actualización o inserción garantizada de `trabajador@canchas.cl` con rol `Trabajador` y vinculación de su entidad asociada `Trabajador`.
     - Actualización o inserción garantizada de `cliente@canchas.cl` con rol `Cliente`.
     - Sembrado seguro de `Sedes`, `TiposCancha` y `Canchas` si las tablas respectivas se encuentran vacías.
  3. **Verificación:** Ejecución y validación en base de datos local SQL Server y pruebas de autenticación contra `/api/v1/usuarios/login`, confirmando respuestas `200 OK` con tokens JWT válidos para los 3 perfiles.
- **Aceptado:** Estrategia idempotente que preserva datos existentes y garantiza la disponibilidad inmediata de los usuarios de evaluación.
- **Corregido:** Se eliminó la condición de omisión global para permitir la auto-reparación del entorno de desarrollo.
- **Descartado:** No se requirió reiniciar o purgar la base de datos completa.
- **Comprendido y explicable:** Sí.

---

## Entrada 12 – Rediseño visual deportivo (Temática Fútbol & CSD Colo-Colo)
- **Fecha/hora:** 2026-10-18 21:10
- **Prompt usado:** mejoremos lo visual del front, algo mas relacionado con el futbol y lo mismo con los colores y seria espectacular una imagen del logo de colocolo
- **Resultado:** Elevación estética integral inspirada en el fútbol profesional chileno y la identidad del CSD Colo-Colo:
  1. **Activos visuales:** Incorporación del escudo oficial de Colo-Colo (con estrella continental, cinta de luto y perfil del cacique) en `frontend/src/assets/colocolo-logo.jpg` e imagen de atmósfera nocturna de estadio bajo reflectores en `frontend/src/assets/stadium-bg.jpg`.
  2. **Identidad de diseño (Tokens):** Actualización de `tokens.css` con paleta Alba (negro carbón `#0b1120`, blanco puro, oro libertadores `#ca8a04`, franja roja `#dc2626` y verde césped estadio `#15803d` / `#166534`).
  3. **Navegación e interfaz:** 
     - Barra superior oscura estilo Estadio Monumental con el escudo oficial, subtítulo de club deportivo y enlaces con resaltado verde césped.
     - Pantalla de inicio de sesión inmersiva con fondo de estadio nocturno, tarjeta glassmorphic con ribete dorado y escudo animado.
     - Tabla y filtros con ribete superior de césped, cabeceras en negro carbón y botones de acción con degradados deportivos y microanimaciones de elevación.
  4. **Accesibilidad y pruebas:** Contraste de texto verificado según WCAG 2.2 AA (mínimo 4.5:1), 16/16 pruebas de componentes pasando sin regresiones y 0 errores de linter.
- **Aceptado:** Integración armónica de los elementos futboleros manteniendo la estructura semántica exigida por la rúbrica.
- **Corregido:** Se aseguraron contrastes accesibles en todos los nuevos estados interactivos y fondos oscuros.
- **Descartado:** No se utilizaron imágenes no optimizadas ni se alteraron los selectores accesibles requeridos por los tests automáticos.
- **Comprendido y explicable:** Sí.

---

## Entrada 13 – Cobertura total de campos de la entidad y recursos relacionados en el Frontend
- **Fecha/hora:** 2026-10-20 20:30
- **Prompt usado:** necesito que añadas en base a la rubrica los campos faltantes en el frontend ya que solicitaba minimo 4 pero me gustaria tenerlos todos , sin perder la logica y sin modificar mucho la interfaz
- **Resultado:** Incorporación de todos los campos del modelo de datos y de los recursos relacionados en las vistas del frontend (Listado, Detalle, Formulario unificado de Canchas y Tipos de Cancha), superando el requerimiento base de 4 campos sin alterar la lógica de negocio ni romper la consistencia visual:
  1. **Vista de Detalle (`CanchaDetailPage.tsx`):**
     - Se integraron todos los atributos disponibles en la grilla responsiva: ID de Cancha (`#id`), Número oficial (`numero`), Estado operativo (`estado`), Precio por hora (`precioPorHora`), Sede (`sedeNombre` e `ID Sede`), Dirección de la Sede (`sede.direccion`), Teléfono de contacto de la Sede (`sede.telefono`), Tipo de Cancha (`tipoCanchaNombre` e `ID Tipo`) y Descripción técnica del tipo (`tipo.descripcion`).
  2. **Vista de Listado (`CanchasListPage.tsx`):**
     - Se añadió la columna explícita de `ID` (`#id`) en la tabla de datos accesible.
     - Se enriquecieron las celdas de Sede y Tipo de Cancha con sus respectivos identificadores secundarios (`ID Sede` e `ID Tipo`).
     - En las tarjetas móviles (`cards-grid`), se incorporó el identificador de cancha y los IDs relacionales.
     - El filtro reactivo de búsqueda en memoria ahora permite buscar también por ID de cancha.
  3. **Formulario de Creación / Edición (`CanchaFormPage.tsx`):**
     - En modo edición se integró un campo accesible de solo lectura para el `ID de Cancha`.
     - Se agregaron cajas informativas reactivas bajo los selectores de Sede y Tipo de Cancha que muestran dinámicamente la Dirección, Teléfono, Tarifa por hora y Descripción de la opción seleccionada.
  4. **Gestión de Tipos de Cancha (`TiposCanchaPage.tsx`):**
     - Visualización del `ID de Tipo` en cada tarjeta del catálogo y en el formulario de edición.
  5. **Estilos y Accesibilidad (`base.css`):**
     - Clases para badges de ID (`.badge-id`), etiquetas de tarjetas (`.card-id-tag`), campos de solo lectura accesibles (`.form-control-readonly`) y cajas informativas (`.field-info-box`), manteniendo contraste WCAG 2.2 AA.
- **Aceptado:** Exposición completa de los atributos del recurso principal y de los recursos relacionados preservando los contratos HTTP, las validaciones con Zod y la navegación móvil.
- **Corregido:** Se garantizó que los campos informativos en formularios utilicen `aria-live="polite"` y no interfieran con los payloads enviados al backend.
- **Descartado:** No se alteró el backend ni se rompieron los contratos de API ni los tests existentes.
- **Comprendido y explicable:** Sí.
