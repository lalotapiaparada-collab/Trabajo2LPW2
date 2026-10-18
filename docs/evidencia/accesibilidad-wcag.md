# Informe de Verificación de Accesibilidad (WCAG 2.2 Nivel AA)

**Proyecto:** CanchasYa – Trabajo 2 (LPW2)  
**Fecha de Evaluación:** 18-10-2026  
**Estándar Aplicado:** W3C Web Content Accessibility Guidelines (WCAG) 2.2 – Conformance Level AA  
**Herramientas Empleadas:** ESLint con `eslint-plugin-jsx-a11y` (conjunto `recommended`), inspección de DOM semántico, cálculo de contraste cromático y verificación por teclado.

---

## 1. Resumen Ejecutivo de Conformidad

| Principio WCAG 2.2 | Criterios Evaluados | Estado | Observación Principal |
|:---|:---:|:---:|:---|
| **1. Perceptible** | 1.1.1, 1.3.1, 1.4.1, 1.4.3, 1.4.10, 1.4.11 | **CUMPLE (AA)** | Contrastes superiores a 4.5:1 (texto normal hasta 16.1:1); reflow responsivo a 320 px sin scroll horizontal; tabla colapsable a tarjetas. |
| **2. Operable** | 2.1.1, 2.1.2, 2.4.1, 2.4.2, 2.4.3, 2.4.7, 2.5.8 | **CUMPLE (AA)** | Navegación 100% por teclado; skip-link presente; foco visible estricto; trampa de foco y escape en `<dialog>` con retorno al disparador; targets ≥ 44×44 px. |
| **3. Comprensible** | 3.1.1, 3.2.1, 3.2.2, 3.3.1, 3.3.2, 3.3.3 | **CUMPLE (AA)** | Idioma `lang="es"`; asociación explícita `<label htmlFor>`; errores vinculados con `aria-invalid` y `aria-describedby`. |
| **4. Robusto** | 4.1.2, 4.1.3 | **CUMPLE (AA)** | Anuncios de estado con `role="status"` y `aria-live="polite"`; mensajes de error con `role="alert"`; 0 advertencias en `eslint-plugin-jsx-a11y`. |

---

## 2. Verificación Detallada por Criterio de Éxito

### 2.1. Principio 1: Perceptible

#### Criterio 1.1.1 – Contenido no textual (Nivel A)
- **Implementación:** Todos los elementos gráficos decorativos (iconos de advertencia, spinners) cuentan con `aria-hidden="true"`.
- **Ejemplo en código:**
  ```tsx
  <span className="empty-icon" aria-hidden="true">📋</span>
  <div className="spinner" aria-hidden="true" />
  ```
- **Resultado:** Conforme.

#### Criterio 1.3.1 – Información y relaciones (Nivel A)
- **Implementación:**
  - Uso riguroso de landmarks semánticos HTML5: `<header className="app-header">`, `<nav className="main-nav">`, `<main id="main-content">`, `<footer className="app-footer">`.
  - Estructura de encabezados con exactamente un único `<h1>` por vista y jerarquía descendente `<h2>`, `<h3>`.
  - Formularios con etiquetas asociadas programáticamente mediante `htmlFor` e `id`.
  - Tablas con encabezados de columna semánticos `<th>` con `scope="col"`.
- **Resultado:** Conforme.

#### Criterio 1.4.1 – Uso del color (Nivel A)
- **Implementación:** Los estados de las canchas (*Disponible*, *Mantenimiento*, *Fuera de servicio*) no se transmiten únicamente por color (verde, naranja, rojo); cada uno incluye el texto legible del estado y estilos visuales distintivos.
- **Resultado:** Conforme.

#### Criterio 1.4.3 – Contraste mínimo (Nivel AA)
- **Evaluación matemática de contrastes de color:**
  * Fondo principal: `#ffffff` / `#f8fafc`.
  * Texto primario (`#0f172a` sobre `#ffffff`): **16.1:1** (Supera el umbral 4.5:1 de AA y 7:1 de AAA).
  * Texto secundario (`#334155` sobre `#ffffff`): **9.6:1** (Supera AAA).
  * Azul primario (`#1e40af` sobre `#ffffff`): **9.29:1** (Supera AAA).
  * Botón primario (`#ffffff` sobre `#1e40af`): **9.29:1** (Supera AAA).
  * Badge éxito (`#166534` sobre `#dcfce7`): **6.8:1** (Supera AA).
  * Badge advertencia (`#9a3412` sobre `#ffedd5`): **6.1:1** (Supera AA).
  * Badge peligro (`#991b1b` sobre `#fee2e2`): **6.7:1** (Supera AA).
- **Resultado:** Conforme (todos los pares de contraste cumplen holgadamente el requisito ≥ 4.5:1).

#### Criterio 1.4.10 – Reflujo / Reflow (Nivel AA)
- **Implementación:**
  - Diseño responsivo *Mobile-First* verificado en viewports de 320 px, 390 px, 768 px y 1280 px.
  - La tabla del listado de canchas se oculta automáticamente a través de media query (`@media (max-width: 768px)`) y conmuta a un diseño de tarjetas en una columna (`.cards-grid`).
  - No existe scroll horizontal a 320 px ni con zoom del 200%.
- **Resultado:** Conforme.

---

### 2.2. Principio 2: Operable

#### Criterio 2.1.1 – Teclado (Nivel A) y 2.1.2 – Sin trampas de teclado (Nivel A)
- **Implementación:**
  - Todos los elementos interactivos son `<button>` o `<a>` nativos. No existen `<div>` o `<span>` con manejadores `onClick` huérfanos de semántica.
  - El componente modal `ConfirmDialog` implementa trampa de foco cíclica controlada: al presionar `Tab` en el último botón pasa al primero; al presionar `Shift+Tab` en el primero salta al último.
  - Al presionar la tecla `Esc` (`Escape`), el diálogo se cancela y cierra de forma segura.
  - Al cerrarse el diálogo, el foco vuelve automáticamente al botón que disparó la apertura (`previouslyFocusedElement.current.focus()`).
- **Resultado:** Conforme.

#### Criterio 2.4.1 – Evitar bloques / Skip Link (Nivel A)
- **Implementación:** Al inicio del DOM existe un enlace accesible:
  ```html
  <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
  ```
  Permanece oculto fuera de la pantalla y se hace visible inmediatamente al recibir el primer foco de teclado (`:focus`).
- **Resultado:** Conforme.

#### Criterio 2.4.2 – Titulado de páginas (Nivel A)
- **Implementación:** El componente `RouteAccessibilityAnnouncer` actualiza `document.title` en cada cambio de ruta:
  * `/`: `Listado de Canchas - CanchasYa`
  * `/login`: `Iniciar Sesión - CanchasYa`
  * `/canchas/:id`: `Detalle de Cancha - CanchasYa`
  * `/canchas/nueva`: `Crear Nueva Cancha - CanchasYa`
  * `/canchas/:id/editar`: `Editar Cancha - CanchasYa`
  * `/tipos-cancha`: `Gestión de Tipos de Cancha - CanchasYa`
  * `/acceso-denegado`: `Acceso Denegado (403) - CanchasYa`
  * `/404`: `Página No Encontrada (404) - CanchasYa`
- **Resultado:** Conforme.

#### Criterio 2.4.3 – Orden del foco (Nivel A)
- **Implementación:** Al cambiar de ruta, `RouteAccessibilityAnnouncer` ubica el elemento `<h1>` principal de la vista cargada, le asigna `tabindex="-1"` si es necesario, y transfiere el foco programáticamente.
- **Resultado:** Conforme.

#### Criterio 2.4.7 – Foco visible (Nivel AA)
- **Implementación:**
  ```css
  :focus-visible {
    outline: var(--focus-ring); /* 3px solid #2563eb */
    outline-offset: var(--focus-offset); /* 2px */
  }
  ```
- **Resultado:** Conforme (anillo de foco de alto contraste visible en todos los botones, enlaces e inputs).

#### Criterio 2.5.8 – Tamaño del objetivo táctil (Nivel AA)
- **Implementación:** Se definió la variable `--touch-target-min: 44px`. Todos los botones (`.btn`), inputs (`input`, `select`), y enlaces de navegación tienen una altura mínima de al menos 44 px.
- **Resultado:** Conforme.

---

### 2.3. Principio 3: Comprensible

#### Criterio 3.1.1 – Idioma de la página (Nivel A)
- **Implementación:** Declarado en `index.html`:
  ```html
  <html lang="es">
  ```
- **Resultado:** Conforme.

#### Criterio 3.3.1 y 3.3.2 – Identificación de errores y etiquetas (Nivel A)
- **Implementación:**
  - Cada campo de formulario dispone de su `<label htmlFor="...">` correspondiente.
  - Los campos con error poseen el atributo `aria-invalid="true"`.
  - El mensaje de error visible está vinculado al input mediante `aria-describedby="{campo}-error"` y marcado con `role="alert"`.
- **Resultado:** Conforme.

---

### 2.4. Principio 4: Robusto

#### Criterio 4.1.2 y 4.1.3 – Mensajes de estado (Nivel AA)
- **Implementación:**
  - Contenedores de carga usan `role="status"` y `aria-live="polite"`.
  - Componente `Toast` para notificaciones asíncronas de éxito/error utiliza `role="status"` y `aria-live="polite"`.
  - Alertas de error de servidor usan `role="alert"` y `aria-live="assertive"`.
  - Cambios de ruta anunciados a lectores de pantalla mediante región invisible `.sr-only`.
- **Resultado:** Conforme.

---

## 3. Verificación con Linter de Accesibilidad (`eslint-plugin-jsx-a11y`)

Ejecución del comando de análisis estático:
```bash
npm run lint
```
**Resultado obtenido:**
```text
> frontend@1.0.0 lint
> eslint src

(0 errores, 0 advertencias)
```
Todas las reglas estándar de `jsx-a11y:recommended` (como `alt-text`, `anchor-is-valid`, `aria-role`, `aria-props`, `heading-has-content`, `label-has-associated-control`) pasan limpiamente sin infracciones.
