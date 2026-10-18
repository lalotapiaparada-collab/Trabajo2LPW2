# Guía de Capturas de Evidencia Manual – CanchasYa

Esta guía detalla los pasos exactos que debes realizar en tu navegador y terminal para generar las capturas de pantalla requeridas para la entrega final del Trabajo 2.

---

## 1. Evidencias de Seguridad

### `01-401-sin-token.png` (HTTP 401 Unauthorized)
1. Con la API levantada, abre una terminal (PowerShell o bash).
2. Ejecuta una petición GET a un recurso protegido sin cabecera de autenticación:
   ```bash
   curl -k -i -X GET https://localhost:7269/api/v1/canchas/1
   ```
3. **Qué debe verse:** La respuesta HTTP con código de estado `401 Unauthorized` y cabecera `WWW-Authenticate: Bearer`.
4. Toma captura de la terminal y guárdala como `docs/evidencia/01-401-sin-token.png`.

---

### `02-403-rol-insuficiente.png` (HTTP 403 Forbidden)
1. Inicia sesión en el frontend con el usuario Cliente (`cliente@canchas.cl` / `Password123!`).
2. Abre la consola de desarrollador (F12) e intenta navegar manualmente escribiendo en la barra de direcciones `https://localhost:5173/canchas/nueva`.
3. **Qué debe verse:** La pantalla de **Acceso Denegado (403)** mostrando: *"Estás autenticado como: Cliente Demo con rol Cliente"*.
4. Toma captura de pantalla completa y guárdala como `docs/evidencia/02-403-rol-insuficiente.png`.

---

### `03-cors-origen-bloqueado.png` (Bloqueo de CORS)
1. Abre tu navegador en cualquier página ajena (por ejemplo `https://google.com` o `https://example.com`).
2. Abre la consola de desarrollador (F12) y ejecuta:
   ```javascript
   fetch('https://localhost:7269/api/v1/canchas', { method: 'GET' })
     .then(r => console.log(r))
     .catch(e => console.error('CORS bloqueado:', e));
   ```
3. **Qué debe verse:** El mensaje en rojo de error de red del navegador:  
   *"Access to fetch at 'https://localhost:7269/api/v1/canchas' from origin 'https://...' has been blocked by CORS policy"*.
4. Toma captura de la consola y guárdala como `docs/evidencia/03-cors-origen-bloqueado.png`.

---

### `04-xss-neutralizado.png` (Defensa contra Cross-Site Scripting)
1. Inicia sesión como Trabajador (`trabajador@canchas.cl` / `Password123!`) o Administrador (`admin@canchas.cl`).
2. Ve a **Tipos de Cancha** (`/tipos-cancha`) y presiona **+ Nuevo Tipo de Cancha**.
3. En el campo **Nombre** ingresa: `Pádel Seguro`.
4. En el campo **Descripción** ingresa exactamente el vector de ataque:
   ```html
   <img src=x onerror=alert('XSS_DETECTADO')> <script>alert(1)</script>
   ```
5. En **Precio por Hora** ingresa: `16000`.
6. Presiona **Crear Tipo**.
7. **Qué debe verse:** La tarjeta recién creada muestra el texto literal `<img src=x onerror=alert('XSS_DETECTADO')> <script>alert(1)</script>` como contenido seguro. **Ninguna alerta emergente de JavaScript se ejecuta**, demostrando la neutralización de XSS.
8. Toma captura y guárdala como `docs/evidencia/04-xss-neutralizado.png`.

---

### `05-rate-limit-429.png` (HTTP 429 Too Many Requests)
1. Abre la pantalla de inicio de sesión (`https://localhost:5173/login`).
2. Ingresa `admin@canchas.cl` con contraseña incorrecta `12345678` y presiona **Ingresar** repetidamente 6 veces seguidas.
3. **Qué debe verse:** En el sexto intento aparece el mensaje: *"Has superado el límite de intentos permitidos... Espera un momento"*, el botón se deshabilita mostrando el contador regresivo: *"Espera 59s para reintentar"*.
4. Toma captura y guárdala como `docs/evidencia/05-rate-limit-429.png`.

---

### `06-cabeceras-seguridad.png` (Security Headers)
1. En la terminal ejecuta:
   ```bash
   curl -k -I https://localhost:7269/health
   ```
2. **Qué debe verse:** Las cabeceras entregadas por ASP.NET Core:
   * `X-Content-Type-Options: nosniff`
   * `X-Frame-Options: DENY`
   * `Referrer-Policy: no-referrer`
   * `Content-Security-Policy: default-src 'self' ...`
3. Toma captura de la terminal y guárdala como `docs/evidencia/06-cabeceras-seguridad.png`.

---

## 2. Evidencias de Accesibilidad y Responsividad

### `11-lighthouse-desktop.html` y `11-lighthouse-mobile.html`
1. Abre Google Chrome o Edge en modo incógnito.
2. Inicia sesión en la aplicación (`https://localhost:5173/`).
3. Abre DevTools (F12) y dirígete a la pestaña **Lighthouse**.
4. Selecciona la categoría **Accesibilidad** (y Rendimiento/Prácticas recomendadas si deseas).
5. Ejecuta el análisis en **Desktop** y luego en **Mobile**.
6. En el menú superior derecho del reporte de Lighthouse, haz clic en **Guardar como HTML** (`Save as HTML`).
7. Guarda los archivos en `docs/evidencia/11-lighthouse-desktop.html` y `docs/evidencia/11-lighthouse-mobile.html`.
8. El puntaje de accesibilidad debe ser **≥ 90**.

---

### `14-responsive-320.png`, `14-responsive-390.png`, `14-responsive-768.png`, `14-responsive-1280.png`
1. En el navegador, abre DevTools (F12) y activa la barra de dispositivos móviles (Ctrl + Shift + M).
2. Ajusta el ancho exacto a:
   * **320 px** (móvil pequeño, ej. iPhone SE / Galaxy Fold externo): verifica que la tabla cambió a tarjetas de una columna y no hay scroll horizontal.
   * **390 px** (móvil moderno estándar, ej. iPhone 12/13/14).
   * **768 px** (tablet portrait).
   * **1280 px** (computador de escritorio con tabla completa visible).
3. Toma captura de cada resolución y guárdalas con sus nombres respectivos en `docs/evidencia/`.

---

## 3. Estado de Reportes Automáticos ya Generados

Los siguientes reportes ya fueron ejecutados y están guardados en `docs/evidencia/`:
* [x] `docs/evidencia/backend-tests.txt` (19/19 tests de integración backend en verde).
* [x] `docs/evidencia/frontend-tests.txt` (16/16 tests de componentes en verde).
* [x] `docs/evidencia/npm-audit.txt` (Auditoría de dependencias frontend).
* [x] `docs/evidencia/dotnet-audit.txt` (Auditoría de paquetes vulnerables backend).
* [x] `docs/evidencia/accesibilidad-wcag.md` (Checklist de cumplimiento WCAG 2.2 AA).
