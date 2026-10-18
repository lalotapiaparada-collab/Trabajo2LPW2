# Seguridad — Mitigaciones OWASP API Security Top 10

Este documento detalla qué vulnerabilidades del OWASP API Security Top 10 se
mitigaron en CanchasApi y cómo, tal como lo exige la pauta del Trabajo 1.

## 1. API1:2023 — Broken Object Level Authorization (BOLA)

**Riesgo:** un usuario autenticado accede a datos de otro usuario cambiando
un ID en la URL (ej. `GET /api/v1/reservas/57` viendo la reserva de otro).

**Mitigación:** en los endpoints que exponen recursos de un usuario
(`/api/v1/usuarios/{id}`, `/api/v1/reservas`, `/api/v1/reservas/{id}`) se
compara el `UsuarioId` del recurso contra el `NameIdentifier` del JWT antes
de responder. Si el rol no es `Administrador` y el recurso no pertenece al
usuario autenticado, se responde `403 Forbidden` (o se filtra la lista, en
el caso de `GET /api/v1/reservas`, para que un `Cliente` solo vea las suyas).

```csharp
if (currentRole != "Administrador" && currentUserId != id)
    return Results.Forbid();
```

## 2. API2:2023 — Broken Authentication

**Riesgo:** tokens firmados con una clave débil, predecible o embebida en
el código fuente, permiten a un atacante forjar JWT válidos.

**Mitigación:**
- Se eliminaron los dos valores de clave JWT hardcodeados que traía el
  proyecto original (`Program.cs` y `UsuarioApi.cs`). Ahora, si `Jwt:Key`
  no está configurada vía `dotnet user-secrets` o variable de entorno, la
  aplicación **no arranca** (falla rápido, en vez de firmar tokens con un
  secreto público conocido).
- Las contraseñas nunca se guardan en texto plano: se usa
  `PasswordHasher<Usuario>` (ASP.NET Core Identity) para hash y verificación.
- El JWT valida `Issuer`, `Audience`, `IssuerSigningKey` y `Lifetime`
  (`ValidateIssuer/Audience/IssuerSigningKey/Lifetime = true`).

## 3. API3:2023 — Broken Object Property Level Authorization (Mass Assignment)

**Riesgo:** un usuario común se autoasigna el rol `Administrador` enviando
`"Rol": "Administrador"` en el body de `POST /registro` o `PUT /{id}`.

**Mitigación:** el campo `Rol` del request solo se aplica si quien hace la
petición ya tiene el rol `Administrador`; en cualquier otro caso se ignora
y el usuario nuevo/actualizado queda como `Cliente` (o mantiene su rol
actual):

```csharp
if (currentRole == "Administrador" && !string.IsNullOrWhiteSpace(request.Rol))
    usuario.Rol = request.Rol;
```

## 4. API5:2023 — Broken Function Level Authorization

**Riesgo:** funciones administrativas (listar todos los usuarios, eliminar
un usuario) accesibles para cualquier usuario autenticado, no solo admins.

**Mitigación:** `GET /api/v1/usuarios` y `DELETE /api/v1/usuarios/{id}`
usan `RequireAuthorization(p => p.RequireRole("Administrador"))`, de forma
que un `Cliente` o `Trabajador` autenticado recibe `403 Forbidden` aunque
tenga un JWT válido.

## 5. API8:2023 — Security Misconfiguration

**Riesgo:** secretos (claves JWT, cadenas de conexión) versionados en el
repositorio o embebidos en el código fuente.

**Mitigación:**
- `appsettings.json` no contiene la clave JWT real (`"Jwt:Key": ""`); se
  gestiona vía `dotnet user-secrets` en desarrollo y variables de entorno
  en producción (documentado en `README.md`).
- Se eliminaron los *fallbacks* hardcodeados de la clave JWT (ver punto 2).
- En desarrollo se usa `UseDeveloperExceptionPage()` solo cuando
  `IsDevelopment()` es verdadero, evitando filtrar stack traces en
  producción.

---

## Pendientes / fuera de alcance de esta iteración

- **API4:2023 — Unrestricted Resource Consumption**: no hay *rate limiting*
  implementado. Se podría agregar `AddRateLimiter` de ASP.NET Core.
- **API9:2023 — Improper Inventory Management**: parcialmente mitigado con
  el versionamiento `/api/v1/...`, pero falta un changelog formal de la API.
