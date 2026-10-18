# Guion de Exposición y Demostración en Vivo – CanchasYa

**Asignatura:** Laboratorio de Programación Web 2 (LPW2)  
**Semestre:** 2026-2  
**Duración Estimada:** 10 - 12 minutos  
**Estudiante expositor:** (Completar con nombre de estudiante)  

---

## 1. Contenido de Diapositivas (8 a 10 Diapositivas)

### Diapositiva 1: Portada y Presentación
* **Título:** CanchasYa – Plataforma Accesible y Segura para Gestión de Canchas Deportivas
* **Subtítulo:** Trabajo 2 – Frontend React + Seguridad sobre CanchasApi (.NET 10)
* **Puntos Clave:**
  - Arquitectura desacoplada (Monolito/SPA) sobre HTTPS.
  - Seguridad defensiva basada en OWASP Top 10 y OWASP API Security Top 10.
  - Accesibilidad WCAG 2.2 Nivel AA y diseño responsivo Mobile-First.

### Diapositiva 2: Arquitectura del Sistema y Monorepo
* **Estructura Monorepo:**
  - `backend/`: ASP.NET Core 10 Minimal API, Entity Framework Core, SQLite (dev/test).
  - `frontend/`: React 18, TypeScript, Vite, TanStack Query, React Hook Form, Zod.
* **Flujo de Comunicación:**
  - Frontend (`https://localhost:5173`) consume API (`https://localhost:7269`).
  - Autenticación mediante tokens JWT Bearer en cabecera HTTP estándar.

### Diapositiva 3: Gestión de Estado en el Cliente
* **Estado de Servidor (Server State):**
  - Implementado con **TanStack Query (React Query v5)**.
  - Caché reactiva, invalidación automática tras mutaciones (`useMutation`), deduplicación de peticiones.
* **Estado Global de Autenticación (Client State):**
  - **React Context API (`AuthContext.tsx`)**.
  - Almacenamiento seguro en `sessionStorage` (aislado por pestaña y auto-destruido al cerrar navegador).
  - Auto-logout al expirar el claim `exp` del JWT.

### Diapositiva 4: Matriz de Riesgos de Seguridad (OWASP)
* **Mitigaciones Principales:**
  - **XSS (A03:2021):** Renderizado en texto plano, regla ESLint `react/no-danger`, directivas CSP.
  - **Robo de Tokens (API2:2023):** `sessionStorage`, token fuera de URL/consola, purga en 401.
  - **Consumo Inseguro de APIs (API10:2023):** Validación de contratos en runtime con Zod.
  - **Fuerza Bruta (API4:2023):** Rate limiter de 5 req/min con HTTP 429 y temporizador de 60s en UI.
  - **Control de Acceso (API5:2023):** Doble barrera (`RoleGuard` en cliente + `RequireRole` en backend).

### Diapositiva 5: Por qué CSRF No Aplica en Esta Arquitectura
* **Concepto:** CSRF depende del envío implícito y automático de cookies por parte del navegador.
* **Justificación Técnica:**
  - La API no utiliza cookies; requiere obligatoriamente `Authorization: Bearer <token>`.
  - Navegadores jamás adjuntan cabeceras `Authorization` automáticamente en peticiones de sitios cruzados.
  - Cualquier petición asíncrona externa que intente adjuntar cabeceras personalizadas dispara Preflight CORS (OPTIONS), el cual es bloqueado por la API al no coincidir el origen.

### Diapositiva 6: Control de Acceso Basado en Roles (RBAC)
* **Matriz de Privilegios:**
  - **Cliente:** Consulta de canchas y visualización de detalles (solo lectura).
  - **Trabajador:** Consulta, creación y edición de canchas y tipos de cancha.
  - **Administrador:** Acceso total, incluyendo eliminación permanente de canchas (`DELETE /api/v1/canchas/{id}`).
* **Defensa en Profundidad:** El cliente adapta la interfaz; el backend valida de forma estricta e independiente.

### Diapositiva 7: Accesibilidad Web (WCAG 2.2 AA)
* **Cumplimiento de Criterios:**
  - **Perceptible:** Contraste mínimo de 4.5:1 (alcanza 16.1:1 en texto principal); reflow a 320 px sin scroll horizontal.
  - **Operable:** 100% navegable por teclado; skip-link; trampa de foco y cierre con `Esc` en modal nativo `<dialog>`.
  - **Comprensible:** Etiquetas asociadas explícitamente (`<label htmlFor>`), errores enlazados con `aria-invalid` y `aria-describedby`.
  - **Robusto:** Anuncios de estado con `role="status"` y `aria-live="polite"`.

### Diapositiva 8: Estrategia de Pruebas Automatizadas
* **Backend:** 19 pruebas de integración xUnit con base de datos SQLite en memoria (`dotnet test`).
* **Frontend:** 16 pruebas unitarias y de componentes con Vitest, React Testing Library y Mock Service Worker (`npm test`).
* **E2E:** Flujo completo de login, creación y visualización con Playwright (`npm run test:e2e`).
* **Análisis Estático:** Linter de seguridad y accesibilidad con 0 errores (`npm run lint`).

### Diapositiva 9: Conclusiones y Demostración en Vivo
* **Logros:** Aplicación productiva, segura, auditada y accesible bajo estándares internacionales.
* **Demostración en vivo:** Verificación en tiempo real de los 10 puntos de control técnico.

---

## 2. Guion de la Demostración en Vivo (~10-12 minutos)

A continuación se detalla exactamente qué hacer, qué escribir y qué debe verse en pantalla durante la exposición oral frente al docente:

### Paso 1: Introducción y Arquitectura (1 min)
* **Acción:** Muestra brevemente la estructura de carpetas en VS Code o terminal:
  - `backend/`: API ASP.NET Core con autenticación JWT y Rate Limiter.
  - `frontend/`: Aplicación React en Vite con cliente Axios centralizado en `frontend/src/api/httpClient.ts`.
* **Qué decir:** *"El sistema separa responsabilidades: el frontend maneja la experiencia y accesibilidad, mientras que el backend aplica autorización estricta en cada endpoint bajo el principio de defensa en profundidad."*

### Paso 2: Login como Cliente y Verificación de Permisos (1 min)
* **Acción:**
  1. En el navegador abre `https://localhost:5173/login`.
  2. Ingresa `cliente@canchas.cl` / `Password123!` y haz clic en **Ingresar**.
* **Qué debe verse:** Entra a la lista de canchas. Observa que **NO** aparece el botón "+ Nueva Cancha" ni los botones de "Editar" o "Eliminar" en la tabla ni en las tarjetas.

### Paso 3: Inspección en DevTools y Limpieza de Sesión (1 min)
* **Acción:**
  1. Abre DevTools (F12) → pestaña **Application** (o Almacenamiento) → **Session Storage** → `https://localhost:5173`.
  2. Muestra las claves `canchas_auth_token` y `canchas_auth_user`.
  3. Pestaña **Network**: filtra por `Fetch/XHR`, haz clic en cualquier petición y muestra la cabecera:
     ```http
     Authorization: Bearer eyJhbGciOi...
     ```
  4. Haz clic en el botón **Cerrar Sesión**.
* **Qué debe verse:** El `sessionStorage` se vacía de inmediato y la aplicación redirige a `/login`.

### Paso 4: Intento de Acceso Sin Token (HTTP 401) (1 min)
* **Acción:**
  1. Intenta abrir directamente en el navegador: `https://localhost:5173/`.
  2. Luego abre una terminal y ejecuta:
     ```bash
     curl -k -i -X GET https://localhost:7269/api/v1/canchas/1
     ```
* **Qué debe verse:**
  - En el navegador: `ProtectedRoute` intercepta la falta de sesión y redirige inmediatamente a `/login`.
  - En la terminal: La API responde con código **`401 Unauthorized`**.

### Paso 5: Rol Insuficiente (HTTP 403) y Escalación de Roles (2 min)
* **Acción:**
  1. Con el usuario Cliente aún autenticado, intenta ingresar manualmente por URL a: `https://localhost:5173/canchas/nueva`.
  2. Luego inicia sesión como Trabajador (`trabajador@canchas.cl` / `Password123!`).
  3. Accede al detalle de cualquier cancha (`/canchas/1`).
  4. Finalmente, inicia sesión como Administrador (`admin@canchas.cl` / `Password123!`).
* **Qué debe verse:**
  - Como Cliente: Pantalla amigable de **Acceso Denegado (403)** indicando que su rol es Cliente.
  - Como Trabajador: Aparece el botón "Editar Cancha", pero **NO** el botón "Eliminar".
  - Como Administrador: Aparecen tanto el botón "Editar" como el botón rojo "**Eliminar Cancha**".

### Paso 6: Neutralización de Cross-Site Scripting (XSS) (1 min)
* **Acción:**
  1. Como Trabajador o Admin, ve a **Tipos de Cancha** (`/tipos-cancha`) y presiona **+ Nuevo Tipo de Cancha**.
  2. En Nombre escribe: `Pádel Seguro`.
  3. En Descripción pega el payload de ataque:
     ```html
     <script>alert('XSS_FALLIDO')</script> <img src=x onerror=alert(1)>
     ```
  4. Precio: `15000`. Clic en **Crear Tipo**.
* **Qué debe verse:** La tarjeta creada muestra literalmente el texto del script dentro de un `<p>`. **No salta ninguna alerta de JavaScript**. Explica que React escapa los caracteres y que la regla ESLint `react/no-danger` prohíbe el uso de `dangerouslySetInnerHTML`.

### Paso 7: Bloqueo de CORS desde Origen No Autorizado (1 min)
* **Acción:**
  1. Abre una pestaña en `https://google.com` (u otro dominio ajeno).
  2. Abre la consola (F12) y ejecuta:
     ```javascript
     fetch('https://localhost:7269/api/v1/canchas').then(console.log).catch(console.error);
     ```
* **Qué debe verse:** Error de red en rojo: *"blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource"*.

### Paso 8: Ataque de Fuerza Bruta y Rate Limiting (HTTP 429) (1 min)
* **Acción:**
  1. Ve a `/login`.
  2. Ingresa `admin@canchas.cl` con contraseña incorrecta `11111111` y pulsa **Ingresar** 6 veces consecutivas rápidamente.
* **Qué debe verse:** En el sexto intento se activa el Rate Limiter de la API. En el frontend se muestra una alerta accesible, los campos se bloquean y el botón muestra un temporizador regresivo: *"Espera 59s para reintentar"*.

### Paso 9: Accesibilidad y Diseño Responsivo (1 min)
* **Acción:**
  1. Recorre la pantalla de inicio usando únicamente la tecla `Tab`: muestra cómo aparece el enlace oculto "Saltar al contenido principal", el anillo azul `:focus-visible` de 3px y cómo el foco salta automáticamente al `<h1>` al cambiar de ruta.
  2. Abre el modal de eliminar cancha: presiona `Tab` (muestra que el foco queda atrapado entre Cancelar y Confirmar sin escaparse) y presiona `Esc` (el diálogo se cierra y el foco regresa al botón).
  3. Abre DevTools en modo responsive (Ctrl + Shift + M) y reduce a **320 px**: muestra que la tabla conmuta a tarjetas de una columna sin desbordamiento horizontal.

### Paso 10: Pruebas Automatizadas en Verde (1 min)
* **Acción:**
  1. En una terminal ejecuta:
     ```bash
     dotnet test backend/CanchasApi.slnx
     ```
  2. En otra terminal ejecuta:
     ```bash
     cd frontend && npm test
     ```
* **Qué debe verse:** 19/19 pruebas superadas en el backend y 16/16 pruebas superadas en el frontend, todas en verde y con 0 fallos.

---

## 3. Banco de 10 Preguntas Probables del Docente y Respuestas Técnicas

### 1. ¿Por qué guardaron el token en `sessionStorage` y no en una cookie `HttpOnly`?
> **Respuesta:**  
> Guardar el token en cookie `HttpOnly` es ideal contra lectura de scripts, pero requiere que el backend y frontend compartan dominio o un reverse proxy para manejar atributos `SameSite` en entornos locales con puertos distintos (`5173` y `7269`). Para mantener la arquitectura REST desacoplada que consume `Authorization: Bearer` sin alterar el contrato del Trabajo 1, optamos por `sessionStorage`. A diferencia de `localStorage`, `sessionStorage` aísla los datos a la pestaña actual y se auto-destruye al cerrarse el navegador. Lo blindamos con Content Security Policy (CSP) y la regla ESLint `react/no-danger`.  
> *Ubicación en código:* `frontend/src/features/auth/AuthContext.tsx` (funciones `login` y `logout`).

### 2. ¿Qué pasa si un atacante logra inyectar código XSS en la aplicación?
> **Respuesta:**  
> Si ocurriera XSS, el atacante podría leer el token almacenado en `sessionStorage`. Sin embargo, aplicamos tres capas de mitigación preventiva:  
> 1. React escapa automáticamente cualquier contenido interpolado en JSX (`<p>{tipo.descripcion}</p>`).  
> 2. Prohibimos terminantemente el uso de `dangerouslySetInnerHTML` mediante la regla ESLint `react/no-danger: "error"`.  
> 3. Implementamos Content Security Policy (CSP) restringiendo `script-src 'self'`, lo que bloquea la ejecución de scripts remotos no autorizados.  
> *Ubicación en código:* `frontend/eslint.config.js` y `frontend/index.html`.

### 3. ¿Por qué el ataque CSRF no aplica en su proyecto?
> **Respuesta:**  
> CSRF se aprovecha de que los navegadores envían automáticamente credenciales implícitas (cookies o sesión HTTP) en peticiones de origen cruzado. Nuestra API no usa cookies; utiliza tokens Bearer explícitos adjuntados en la cabecera `Authorization`. Un atacante mediante un formulario malicioso en otro sitio no puede obligar al navegador de la víctima a incluir una cabecera personalizada como `Authorization`. Además, cualquier intento con JavaScript desde otro origen es bloqueado por la verificación de Preflight (OPTIONS) de nuestra política CORS.  
> *Ubicación en código:* `frontend/src/api/httpClient.ts` (interceptor de request) y `backend/CanchasApi/Program.cs` (`FrontendPolicy`).

### 4. ¿Qué diferencia hay entre una respuesta HTTP 401 y una HTTP 403?
> **Respuesta:**  
> - **401 Unauthorized:** Significa *falta de autenticación* (el usuario no ha presentado credenciales válidas o el token expiró). La respuesta incluye cabecera `WWW-Authenticate: Bearer`.  
> - **403 Forbidden:** Significa *falta de autorización* (el servidor sabe quién eres porque tu token es válido, pero tu rol o privilegios no te permiten ejecutar esa acción, como un Cliente intentando eliminar una cancha).  
> *Ubicación en código:* `backend/CanchasApi.Tests/CanchasAutorizacionTests.cs` (donde se comprueba 401 sin token y 403 con rol Cliente).

### 5. ¿Dónde y cómo se adjunta el token JWT en las peticiones salientes?
> **Respuesta:**  
> Se adjunta de forma centralizada en el interceptor de peticiones de Axios (`httpClient.interceptors.request.use`). Antes de que cada solicitud salga a la red, el interceptor recupera el token de `sessionStorage` mediante la clave `canchas_auth_token` y lo inserta en la cabecera `config.headers.Authorization = "Bearer " + token`. Nunca viaja en parámetros de la URL ni en el cuerpo de peticiones GET.  
> *Ubicación en código:* `frontend/src/api/httpClient.ts` (líneas 19-33).

### 6. Si el frontend ya tiene `RoleGuard` que oculta botones, ¿por qué también validan roles en el backend?
> **Respuesta:**  
> Por el principio de **Defensa en Profundidad**. La seguridad en el cliente es solo de usabilidad (evita que el usuario vea opciones que no puede usar), pero cualquier usuario malicioso puede modificar el código JavaScript en DevTools o usar herramientas como `curl` o Postman para saltarse los guards de la interfaz. Por eso, el backend valida obligatoriamente cada endpoint crítico mediante la directiva `RequireRole("Administrador")` en ASP.NET Core.  
> *Ubicación en código:* `frontend/src/features/auth/RoleGuard.tsx` (cliente) y `backend/CanchasApi/Endpoints/CanchaApi.cs` (servidor).

### 7. ¿Qué hace el interceptor de respuestas cuando la API retorna un 401?
> **Respuesta:**  
> El interceptor de respuesta (`httpClient.interceptors.response.use`) captura el error 401, distingue si ocurrió durante el intento de login o en una ruta protegida. Si es en una ruta protegida, purga inmediatamente el token y los datos de usuario de `sessionStorage` para limpiar la sesión comprometida o caducada, y redirige al usuario a `/login?expired=1` informándole que su sesión expiró por seguridad.  
> *Ubicación en código:* `frontend/src/api/httpClient.ts` (líneas 54-70).

### 8. ¿Por qué validan las respuestas de la API con Zod si se supone que el backend ya valida?
> **Respuesta:**  
> Para mitigar la vulnerabilidad **OWASP API10:2023 (Consumo Inseguro de APIs)**. El frontend no debe asumir ciegamente que las respuestas de red son confiables o inmutables (podría haber un intermediario malicioso, respuestas truncadas o cambios no sincronizados en la API). Al pasar cada respuesta por esquemas como `CanchaResponseSchema.parse(response.data)`, garantizamos en tiempo de ejecución que los tipos de datos corresponden a los esperados antes de que React intente renderizarlos.  
> *Ubicación en código:* `frontend/src/services/canchasService.ts` y `frontend/src/types/index.ts`.

### 9. ¿Cómo resolvieron la gestión del foco en el diálogo de confirmación de eliminación?
> **Respuesta:**  
> Utilizamos el elemento nativo HTML5 `<dialog>` mediante el método `showModal()`. En el componente `ConfirmDialog.tsx`:  
> 1. Guardamos el elemento que tenía el foco antes de abrir (`previouslyFocusedElement.current = document.activeElement`).  
> 2. Implementamos una trampa de foco (`handleKeyDown` con `Tab` y `Shift+Tab`) para que el teclado cicle únicamente entre los botones de "Cancelar" y "Confirmar".  
> 3. Capturamos la tecla `Escape` para cerrar el diálogo de forma no destructiva.  
> 4. Al cerrarse, devolvemos el foco automáticamente al botón que abrió el modal (`previouslyFocusedElement.current.focus()`).  
> *Ubicación en código:* `frontend/src/components/ConfirmDialog.tsx`.

### 10. ¿Qué prompts usaron con la Inteligencia Artificial y qué errores tuvieron que corregir manualmente?
> **Respuesta:**  
> Usamos Antigravity con un plan de trabajo por fases de 10 etapas, exigiendo commits convencionales pequeños y pruebas en cada paso. Tuvimos que corregir tres situaciones clave:  
> 1. En el backend, las opciones de JWT y Rate Limiter capturaban la configuración al inicio ignorando las variables de prueba de `CustomWebApplicationFactory`; se corrigió evaluando `builder.Configuration` dinámicamente en los callbacks.  
> 2. En el frontend, el parser por defecto de ESLint fallaba con sintaxis TypeScript; se integró `typescript-eslint` en la configuración flat (`eslint.config.js`).  
> 3. En `AuthContext.tsx`, detectamos que calcular expiraciones muy lejanas en tokens de prueba superaba el valor máximo de entero con signo de 32 bits en `setTimeout` (2.147.483.647 ms), disparando auto-logouts inmediatos por overflow; se corrigió protegiendo el temporizador con `MAX_TIMEOUT_MS`.  
> *Ubicación en código:* Documentado transparentemente en `AI_LOG.md` (Entradas 1 a 10).
