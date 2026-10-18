# CanchasYa – Frontend (React + TypeScript + Vite)

Aplicación cliente para la gestión accesible y segura de canchas deportivas.

---

## 1. Tecnologías Empleadas

* **React 18** y **TypeScript 5**.
* **Vite 5** con plugin `@vitejs/plugin-basic-ssl` para soporte HTTPS en desarrollo local.
* **TanStack Query (React Query v5)** para gestión del estado asíncrono y caché del servidor.
* **React Hook Form** + **Zod** para validación de formularios y contratos de datos de la API.
* **Axios** para peticiones HTTP con interceptores de seguridad.
* **CSS Puro** con variables y tokens de diseño accesibles (WCAG 2.2 AA).
* **Vitest** + **React Testing Library** + **Mock Service Worker (MSW)** para pruebas de componentes.
* **Playwright** para pruebas E2E.

---

## 2. Variables de Entorno

Crear archivo `.env` en la raíz de `frontend/` a partir de la plantilla:

```bash
cp .env.example .env
```

Contenido de `.env`:
```ini
# URL base de la API backend sobre HTTPS
VITE_API_URL=https://localhost:7269
```

> **Regla de Seguridad:** Ningún secreto o token JWT debe alojarse en archivos `.env` del frontend. Las variables con prefijo `VITE_` son embebidas públicamente en los artefactos de compilación.

---

## 3. Comandos de Desarrollo y Pruebas

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con HTTPS (puerto 5173)
npm run dev

# Compilar para producción (TypeScript check + Vite bundle)
npm run build

# Previsualizar el bundle generado
npm run preview

# Ejecutar pruebas unitarias y de integración (Vitest + MSW)
npm test

# Ejecutar linter de accesibilidad y seguridad (ESLint + jsx-a11y)
npm run lint

# Ejecutar pruebas End-to-End con Playwright
npm run test:e2e
```

---

## 4. Medidas de Seguridad Clave

* **CSP en `index.html`:** Restringe conexiones salientes únicamente a `self` y al backend `https://localhost:7269`.
* **Prohibición de XSS:** Regla ESLint `react/no-danger: "error"` bloquea cualquier uso de `dangerouslySetInnerHTML`.
* **Manejo de HTTP 429:** La pantalla de login captura la limitación de peticiones y bloquea el formulario con un contador regresivo de 60 segundos.
* **Protección de Sesión:** El token JWT se guarda exclusivamente en `sessionStorage` y es purgado automáticamente si expira o si el servidor retorna HTTP 401.
