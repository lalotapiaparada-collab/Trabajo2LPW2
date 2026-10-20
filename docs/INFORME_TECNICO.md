# Informe Técnico – CanchasYa (Trabajo 2 LPW2)

**Asignatura:** Laboratorio de Programación Web 2 (LPW2)  
**Semestre:** 2026-2  
**Estudiante:** (Rodrigo Eduardo Andres Tapia Parada)
**Repositorio GitHub:** [lalotapiaparada-collab/Trabajo2LPW2](https://github.com/lalotapiaparada-collab/Trabajo2LPW2)  
**Fecha:** 18 de octubre de 2026  

---

## 1. Arquitectura y Estructura del Proyecto

El sistema está concebido bajo una arquitectura desacoplada monolito/SPA en monorepo:
* **Backend:** ASP.NET Core Minimal API (.NET 10.0), con Entity Framework Core y SQLite en desarrollo/testing.
* **Frontend:** Single Page Application (SPA) construida con React 18, TypeScript y Vite, sirviendo sobre HTTPS local en puerto `5173`.

### Estructura de Directorios del Frontend (`frontend/src/`)
```text
frontend/src/
├── api/
│   └── httpClient.ts              # Cliente Axios con interceptores Bearer y 401
├── assets/                        # Recursos estáticos e imágenes accesibles
├── components/
│   ├── ConfirmDialog.tsx          # Diálogo modal nativo con trampa de foco
│   ├── Layout.tsx                 # Estructura semántica (header, nav, main, footer)
│   ├── RouteAccessibilityAnnouncer.tsx # Gestor de foco y títulos de página
│   └── Toast.tsx                  # Notificaciones asíncronas accesibles
├── features/
│   ├── auth/                      # Contexto, LoginPage, ProtectedRoute, RoleGuard
│   ├── canchas/                   # CanchasListPage, CanchaDetailPage, CanchaFormPage
│   └── tipos-cancha/              # TiposCanchaPage, useTiposCanchaQuery
├── routes/
│   ├── AccessDeniedPage.tsx       # Vista de acceso denegado (HTTP 403)
│   └── NotFoundPage.tsx           # Vista 404
├── services/                      # Llamadas a API tipadas con validación Zod
├── styles/
│   ├── tokens.css                 # Variables de diseño y contrastes WCAG 2.2 AA
│   └── base.css                   # Resets accesibles, grid/flexbox y botones
├── test/                          # Pruebas con Vitest, Testing Library y MSW
└── types/                         # Interfaces TypeScript y esquemas Zod
```

---

## 2. Manejo de Estado

Se adoptó una separación clara entre estado de servidor y estado de cliente:
1. **Estado del Servidor (Server State):** Gestionado mediante **TanStack Query (React Query v5)**.
   * Ventajas: caché reactiva en memoria, deduplicación de peticiones, actualización automática tras mutaciones (`invalidateQueries`), y estados de carga (`isLoading`, `isError`) normalizados.
2. **Estado Global de Autenticación (Client State):** Implementado con **React Context API (`AuthContext.tsx`)**.
   * Expone: `token`, `usuario`, `isAuthenticated`, `isLoading`, `login()`, `logout()`.
   * Monitorea la expiración del token JWT y programa un temporizador para auto-logout.

---

## 3. Estrategia de Almacenamiento del Token y Análisis de Riesgos

El token JWT se almacena en el cliente utilizando **`sessionStorage`**:

### ¿Por qué `sessionStorage` y no `localStorage`?
* **Aislamiento por pestaña:** El token solo existe durante la sesión activa de la pestaña actual. Si el usuario cierra la pestaña o el navegador, la sesión desaparece inmediatamente, previniendo que sesiones desatendidas en computadores compartidos sigan activas.
* **Mitigación frente a XSS:** Si bien ambos storages pueden ser leídos por scripts maliciosos si existiese XSS, `localStorage` persiste indefinidamente en disco, mientras que `sessionStorage` tiene una ventana de exposición mucho más reducida y se auto-destruye.

### ¿Por qué no usamos Cookies con `HttpOnly` en esta entrega?
* Las cookies `HttpOnly` ofrecen la máxima protección contra robo de tokens vía JavaScript; no obstante, requieren soporte de backend con afinidad de dominio para cookies de terceros o un reverse proxy unificado para evitar restricciones de `SameSite=Lax/Strict` en entornos con puertos cruzados (`localhost:5173` vs `localhost:7269`).
* Para cumplir el requerimiento de no alterar la arquitectura REST base del Trabajo 1 (donde la API consume `Authorization: Bearer <token>`), se mantuvo el token en cabecera HTTP complementado con:
  1. Destrucción en `sessionStorage` al cerrar sesión o recibir HTTP 401.
  2. Directivas estrictas de Content Security Policy (CSP) en cliente y servidor.
  3. Prohibición de `dangerouslySetInnerHTML` con regla ESLint `react/no-danger`.

---

## 4. Por qué el Ataque CSRF No Aplica en este Sistema

El ataque de **Falsificación de Petición en Sitios Cruzados (Cross-Site Request Forgery - CSRF)** ocurre cuando un navegador incluye automáticamente credenciales implícitas (como cookies de sesión o cabeceras de autenticación básica) en peticiones disparadas desde un sitio web externo malicioso.

En CanchasYa, **CSRF no aplica técnicamente** debido a los siguientes motivos:
1. **Credenciales Explícitas (Bearer Token):** La API REST no utiliza cookies de autenticación. Cada petición autenticada requiere adjuntar explícitamente la cabecera HTTP personalizada `Authorization: Bearer <token>`.
2. **Navegadores no adjuntan cabeceras personalizadas de forma implícita:** Un formulario HTML clásico (`<form action="https://localhost:7269/api/v1/canchas" method="POST">`) alojado en un sitio malicioso no puede adjuntar cabeceras `Authorization` personalizadas.
3. **Mecanismo CORS Preflight:** Peticiones asíncronas (`fetch` / `XMLHttpRequest`) enviadas desde un origen no autorizado que intenten agregar la cabecera `Authorization` disparan obligatoriamente una solicitud OPTIONS (Preflight). El backend ASP.NET Core rechaza el preflight con `403 Forbidden` al no coincidir el origen con `Cors:AllowedOrigins`.

---

## 5. Medidas de Seguridad Implementadas

1. **Defensa en Profundidad:**
   * **En el cliente:** `RoleGuard.tsx` oculta rutas y controles sensibles para mejorar la experiencia de usuario.
   * **En el servidor:** Los endpoints de ASP.NET Core validan obligatoriamente el rol del JWT (`RequireRole("Administrador")`). Si un atacante omite el guard del cliente, la API rechaza la solicitud con **HTTP 403 Forbidden**.
2. **Protección contra Inyección y XSS:**
   * React escapa cadenas por defecto (`<p>{tipo.descripcion}</p>`).
   * Regla de análisis estático `react/no-danger: "error"` activa en ESLint.
   * Content Security Policy en `index.html` y servidor Vite (`script-src 'self'`).
3. **Validación de Respuestas de API (OWASP API10:2023):**
   * Toda respuesta HTTP consumida en `src/services/` es analizada con esquemas Zod antes de propagarse a los componentes, previniendo vulnerabilidades por alteración de tipos o datos maliciosos no tipados.
4. **Manejo de Fuerza Bruta y Rate Limiting:**
   * Límite de 5 peticiones/minuto en `/login`. Al recibir status 429, el cliente inicia un temporizador regresivo de 60 segundos deshabilitando las interacciones.

> Consulta la matriz completa de riesgos en [docs/MATRIZ_RIESGOS.md](file:///c:/Users/chris/Downloads/CanchasApi26-08/docs/MATRIZ_RIESGOS.md) y los cambios técnicos del backend en [docs/CAMBIOS_API.md](file:///c:/Users/chris/Downloads/CanchasApi26-08/docs/CAMBIOS_API.md).

---

## 6. Accesibilidad (WCAG 2.2 AA) y Diseño Responsivo

* **Navegación por Teclado:** Se implementó un enlace "Saltar al contenido principal" (`.skip-link`) y un anillo de foco `:focus-visible` de 3px azul de alto contraste.
* **Gestión del Foco:** El componente `RouteAccessibilityAnnouncer` transfiere el foco al `<h1>` de cada página al navegar. El modal nativo `<dialog>` cuenta con trampa de foco, cierre con `Escape` y retorno de foco al elemento disparador.
* **Contrastes Cromáticos:** Verificados rigurosamente; el texto principal sobre blanco alcanza un ratio de contraste de **16.1:1** (superando el estándar AAA de 7:1).
* **Diseño Responsivo:** Mobile-First funcional desde 320 px de ancho sin desbordamiento horizontal. La tabla de canchas conmuta a tarjetas adaptadas a pantallas táctiles en dispositivos móviles (≤ 768 px).
* **Tamaño de Controles Táctiles:** Mínimo de 44×44 px en todos los botones, enlaces e inputs (`--touch-target-min: 44px`).
