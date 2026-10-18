# Cambios y Endurecimiento de la API (Trabajo 2 LPW2)

Este documento registra detalladamente los ajustes y mejoras de seguridad aplicados sobre la API base (`CanchasApi`) para posibilitar el consumo seguro desde navegadores web y cumplir con los requisitos de seguridad y roles.

---

## Matriz de Hallazgos y Soluciones Aplicadas

### H1. Configuración de CORS con Orígenes Explícitos
- **Problema previo:** No existía política de CORS en `Program.cs`. El navegador bloqueaba cualquier petición realizada desde el frontend React debido a la política del mismo origen (SOP).
- **Solución implementada:** Se configuró `AddCors` con la política `FrontendPolicy`, leyendo los orígenes permitidos desde `Cors:AllowedOrigins` (por defecto `https://localhost:5173`). Se restringieron los métodos a `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` y las cabeceras a `Authorization`, `Content-Type`, `Accept`. Prohibido el uso de `AllowAnyOrigin`.
- **Ubicación:** `backend/CanchasApi/Program.cs` (`AddCors` y `app.UseCors("FrontendPolicy")` antes de `app.UseAuthentication()`).
- **Verificación:** Petición `OPTIONS` con cabecera `Origin: https://localhost:5173` devuelve `Access-Control-Allow-Origin: https://localhost:5173`. Con un origen no autorizado (`https://sitio-malicioso.com`), la cabecera no se devuelve.

---

### H2. Rate Limiting en Endpoint de Login
- **Problema previo:** El endpoint `/api/v1/usuarios/login` no poseía control de frecuencia de peticiones, haciéndolo vulnerable a ataques de fuerza bruta y denegación de servicio (OWASP API4:2023).
- **Solución implementada:** Se integró el middleware de `AddRateLimiter` con algoritmo de ventana fija (`FixedWindowRateLimiter`) de 5 peticiones por minuto por IP remota. Si se supera el umbral, la API responde con código HTTP `429 Too Many Requests`. El límite es parametrizable mediante `RateLimiting:LoginPermitLimit` para facilitar pruebas automatizadas.
- **Ubicación:** `backend/CanchasApi/Program.cs` y `.RequireRateLimiting("login")` en `backend/CanchasApi/Endpoints/UsuarioApi.cs`.
- **Verificación:** Al enviar 6 peticiones consecutivas al endpoint `/api/v1/usuarios/login` en menos de 1 minuto, la 6ª petición es rechazada con código `429`.

---

### H3. Cabeceras de Seguridad HTTP y HSTS
- **Problema previo:** Las respuestas no incluían cabeceras de protección del cliente, permitiendo potenciales ataques de clickjacking, MIME sniffing y vulnerabilidades en transporte (OWASP API8:2023).
- **Solución implementada:** Se implementó un middleware HTTP personalizado al inicio del pipeline que inyecta:
  - `X-Content-Type-Options: nosniff` (evita interpretación incorrecta de tipos MIME).
  - `X-Frame-Options: DENY` (evita clickjacking impidiendo enmarcar en `<iframe>`).
  - `Referrer-Policy: no-referrer` (evita fugas de URLs sensibles en cabecera Referer).
  - `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'` (restringe fuentes; se excluye condicionalmente en desarrollo para `/scalar` y `/openapi` para no romper la documentación interactiva).
  - `app.UseHsts()` activo en entornos fuera de Development para forzar HTTPS estricto.
- **Ubicación:** `backend/CanchasApi/Program.cs`.
- **Verificación:** Inspección de cabeceras HTTP con `curl -I` muestra todas las cabeceras mencionadas presentes en las respuestas.

---

### H4. Ocultamiento de Detalles Internos en `/health`
- **Problema previo:** Si la base de datos no respondía o ocurría una excepción, el endpoint `/health` retornaba `Results.Problem(detail: ex.Message)`, exponiendo nombres de servidores, usuarios y detalles internos del motor SQL.
- **Solución implementada:** Se inyectó `ILogger<Program>` para registrar el error técnico en los logs del servidor y se retorna un mensaje genérico `"No se pudo conectar con el servicio de base de datos."` con código 503 sin traza interna.
- **Ubicación:** `backend/CanchasApi/Program.cs`.
- **Verificación:** Ante fallo de base de datos, el cuerpo retornado es genérico y no contiene excepciones internas de EF Core o SQLClient.

---

### H5. Manejador Global de Excepciones
- **Problema previo:** En entornos fuera de Development no existía un manejador de excepciones global, lo que ante un fallo inesperado podía emitir trazas de pila (stack traces) o respuestas HTML del servidor web.
- **Solución implementada:** Se implementó `app.UseExceptionHandler` para responder un JSON estándar `ProblemDetails` con código 500 y mensaje genérico, protegiendo la arquitectura interna del sistema.
- **Ubicación:** `backend/CanchasApi/Program.cs`.
- **Verificación:** Al simular una excepción no capturada fuera de desarrollo, el cliente recibe un JSON normalizado con código 500 y sin stack trace.

---

### H6. Seeder de Datos de Desarrollo (`DevSeeder`)
- **Problema previo:** No existía forma automatizada de crear usuarios con rol `Administrador` o `Trabajador` (el endpoint `/registro` solo creaba `Cliente`), impidiendo probar y demostrar los 3 roles en vivo.
- **Solución implementada:** Se creó la clase `DevSeeder` que, únicamente en entorno `Development` y si no existen usuarios en la base de datos, inserta:
  - 1 Administrador (`admin@canchas.cl`)
  - 1 Trabajador (`trabajador@canchas.cl`)
  - 1 Cliente (`cliente@canchas.cl`)
  - 2 Sedes ("Sede Central", "Sede Norte")
  - 3 Tipos de Cancha ("Fútbol 7", "Pádel Techado", "Tenis Arcilla")
  - 8 Canchas distribuidas entre sedes y tipos con distintos estados
  La contraseña se lee de `Seed:AdminPassword` en `dotnet user-secrets` o usa valor seguro por defecto para pruebas locales.
- **Ubicación:** `backend/CanchasApi/Services/DevSeeder.cs` y ejecución en `Program.cs`.
- **Verificación:** Al arrancar la aplicación en `Development` sobre base de datos limpia, los usuarios y recursos quedan disponibles de inmediato para iniciar sesión.

---

### H7. Eliminación de Credenciales Expuestas en Documentación y Configuración
- **Problema previo:** El archivo `README.md` contenía una cadena de conexión con `user id=sa;password=ipvg2026;` y `appsettings.json` contenía una clave JWT hardcodeada.
- **Solución implementada:** Se reemplazó la credencial en `README.md` por marcadores genéricos `<tu_usuario>` y `<tu_password>`, y se vació `"Key": ""` en `appsettings.json` delegando la configuración a `dotnet user-secrets`.
- **Ubicación:** `backend/CanchasApi/README.md` y `backend/CanchasApi/appsettings.json`.
- **Verificación:** Búsqueda en el historial y árbol de Git (`git grep -i "ipvg2026"`) no arroja resultados.

---

### H11. Validación de Entradas en Registro de Usuario
- **Problema previo:** El registro solo comprobaba que los campos no fueran vacíos, permitiendo emails inválidos, contraseñas de un carácter y nombres excesivamente largos.
- **Solución implementada:** Se añadieron validaciones estrictas:
  - Formato válido de correo electrónico con `EmailAddressAttribute`.
  - Contraseña con longitud mínima de 8 caracteres.
  - Nombre con longitud máxima de 100 caracteres.
  - Respuestas `400 Bad Request` consistentes con formato `{ error = "..." }`.
- **Ubicación:** `backend/CanchasApi/Endpoints/UsuarioApi.cs`.
- **Verificación:** Envío de passwords de 4 caracteres o emails con formato incorrecto responde `400 Bad Request`.

---

### H12. Eliminación de Método con Typo `VerifyPassowrd`
- **Problema previo:** En `AuthService.cs` existía una sobrecarga redundante con nombre mal escrito (`VerifyPassowrd`).
- **Solución implementada:** Se eliminó el método redundante manteniendo únicamente `VerifyPassword`.
- **Ubicación:** `backend/CanchasApi/Services/AuthService.cs`.
- **Verificación:** Compilación limpia y pruebas existentes en verde.

---

### H13. Restricción de Eliminación de Canchas a Administrador
- **Problema previo:** El endpoint `DELETE /api/v1/canchas/{id}` permitía ser ejecutado tanto por `Trabajador` como por `Administrador`, lo que no permitía diferenciar los 3 roles en las pruebas de autorización de la rúbrica.
- **Solución implementada:** Se cambió la regla de autorización a `.RequireRole("Administrador")`. De este modo:
  - **Cliente:** Solo lectura (`GET`).
  - **Trabajador:** Lectura y edición/creación (`GET`, `POST`, `PUT`).
  - **Administrador:** Todas las anteriores más eliminación (`DELETE`).
- **Ubicación:** `backend/CanchasApi/Endpoints/CanchaApi.cs`.
- **Verificación:** Petición `DELETE /api/v1/canchas/1` con token de Trabajador responde `403 Forbidden`; con Administrador responde `204 NoContent`.

---

### H14. Ajuste de Expiración JWT y ClockSkew
- **Problema previo:** El token tenía tolerancia de reloj (`ClockSkew`) por defecto de 5 minutos, retrasando la expiración efectiva del token.
- **Solución implementada:** Se configuró `ClockSkew = TimeSpan.FromMinutes(1)` en `TokenValidationParameters` y se ajustó el tiempo de expiración de referencia a 30 minutos en plantilla `.env.example`.
- **Ubicación:** `backend/CanchasApi/Program.cs`.
- **Verificación:** Inspección de parámetros de validación en arranque de la aplicación.
