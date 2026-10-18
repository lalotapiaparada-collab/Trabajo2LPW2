# ReservasCanchasDB API

API REST construida con ASP.NET Core Minimal APIs (.NET 10), Entity Framework Core, Autenticación JWT y documentación interactiva con Scalar.

## Configuración y Base de Datos

La base de datos `ReservasCanchasDB` utiliza por defecto **LocalDB**:
```
Server=(localdb)\MSSQLLocalDB;Initial Catalog=ReservasCanchasDB;Integrated Security=True;Encrypt=False
```

### Configuración con dotnet user-secrets
Para gestionar las credenciales y la clave JWT en desarrollo:
```bash
# Conexión LocalDB (Recomendada para desarrollo local):
dotnet user-secrets set "ConnectionStrings:miconexion" "Server=(localdb)\MSSQLLocalDB;Initial Catalog=ReservasCanchasDB;Integrated Security=True;Encrypt=False"

# Alternativa: SQLEXPRESS con autenticación SQL:
# dotnet user-secrets set "ConnectionStrings:miconexion" "Server=.\sqlexpress;Initial Catalog=ReservasCanchasDB;user id=<tu_usuario>;password=<tu_password>;Encrypt=False"

# Clave secreta JWT (OBLIGATORIA: la API no arranca sin ella):
dotnet user-secrets set "Jwt:Key" "<genera-una-clave-larga-y-aleatoria-aca>"
```

> **Importante:** la clave JWT ya no tiene valor por defecto en el código (antes había una clave hardcodeada, lo cual es una vulnerabilidad OWASP API Security Top 10 — *Broken Authentication*). Si `Jwt:Key` no está configurada, la aplicación lanza una excepción al iniciar en vez de usar un secreto embebido.

## Ejecución
```bash
dotnet run --launch-profile http
```

- **Scalar API Reference:** `http://localhost:5098/scalar/v1`
- **Comprobación de Salud:** `http://localhost:5098/health`
