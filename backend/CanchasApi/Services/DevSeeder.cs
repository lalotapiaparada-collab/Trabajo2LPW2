using CanchasApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CanchasApi.Services
{
    /// <summary>
    /// Seeder exclusivo para el entorno de Desarrollo.
    /// Crea usuarios de prueba para cada rol, sedes, tipos de cancha y canchas
    /// para permitir la demostración en vivo sin requerir inserciones manuales.
    /// </summary>
    public static class DevSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider, IConfiguration configuration, ILogger logger)
        {
            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ReservasCanchasDbContext>();
            var auth = scope.ServiceProvider.GetRequiredService<AuthService>();

            try
            {
                if (!await db.Database.CanConnectAsync())
                {
                    logger.LogInformation("DevSeeder: Base de datos no disponible aún, omitiendo siembra automática.");
                    return;
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "DevSeeder: No se pudo verificar la base de datos.");
                return;
            }

            // Si ya existen usuarios registrados, no duplicamos datos
            if (await db.Usuarios.AnyAsync())
            {
                return;
            }

            var password = configuration["Seed:AdminPassword"];
            if (string.IsNullOrWhiteSpace(password))
            {
                password = "AdminDev2026!";
            }

            logger.LogInformation("DevSeeder: Sembrando datos iniciales de desarrollo...");

            // 1. Sedes
            var sedeCentral = new Sede { Nombre = "Sede Central", Direccion = "Av. Libertador 1234", Telefono = "+56911112222" };
            var sedeNorte = new Sede { Nombre = "Sede Norte", Direccion = "Camino Norte 567", Telefono = "+56933334444" };
            db.Sedes.AddRange(sedeCentral, sedeNorte);
            await db.SaveChangesAsync();

            // 2. Tipos de Cancha
            var tipoFutbol = new TipoCancha { Nombre = "Fútbol 7", Descripcion = "Cancha de pasto sintético con iluminación LED", PrecioPorHora = 25000m };
            var tipoPadel = new TipoCancha { Nombre = "Pádel Techado", Descripcion = "Cancha de cristal templado techada con ventilación", PrecioPorHora = 18000m };
            var tipoTenis = new TipoCancha { Nombre = "Tenis Arcilla", Descripcion = "Cancha de arcilla tradicional para singles o dobles", PrecioPorHora = 15000m };
            db.TiposCancha.AddRange(tipoFutbol, tipoPadel, tipoTenis);
            await db.SaveChangesAsync();

            // 3. Canchas (~8 canchas de prueba)
            var canchas = new List<Cancha>
            {
                new Cancha { Numero = 1, SedeId = sedeCentral.Id, TipoCanchaId = tipoFutbol.Id, Estado = "Disponible" },
                new Cancha { Numero = 2, SedeId = sedeCentral.Id, TipoCanchaId = tipoFutbol.Id, Estado = "Disponible" },
                new Cancha { Numero = 3, SedeId = sedeCentral.Id, TipoCanchaId = tipoPadel.Id, Estado = "Disponible" },
                new Cancha { Numero = 4, SedeId = sedeCentral.Id, TipoCanchaId = tipoPadel.Id, Estado = "Mantenimiento" },
                new Cancha { Numero = 5, SedeId = sedeNorte.Id, TipoCanchaId = tipoFutbol.Id, Estado = "Disponible" },
                new Cancha { Numero = 6, SedeId = sedeNorte.Id, TipoCanchaId = tipoPadel.Id, Estado = "Disponible" },
                new Cancha { Numero = 7, SedeId = sedeNorte.Id, TipoCanchaId = tipoTenis.Id, Estado = "Disponible" },
                new Cancha { Numero = 8, SedeId = sedeNorte.Id, TipoCanchaId = tipoTenis.Id, Estado = "Fuera de servicio" }
            };
            db.Canchas.AddRange(canchas);
            await db.SaveChangesAsync();

            // 4. Usuarios para los 3 roles
            var adminUser = new Usuario
            {
                Nombre = "Administrador Principal",
                Email = "admin@canchas.cl",
                Rol = "Administrador",
                FechaCreacion = DateTime.UtcNow
            };
            adminUser.PasswordHash = auth.HashPassword(adminUser, password);

            var trabajadorUser = new Usuario
            {
                Nombre = "Trabajador Operativo",
                Email = "trabajador@canchas.cl",
                Rol = "Trabajador",
                FechaCreacion = DateTime.UtcNow
            };
            trabajadorUser.PasswordHash = auth.HashPassword(trabajadorUser, password);

            var clienteUser = new Usuario
            {
                Nombre = "Cliente Demostración",
                Email = "cliente@canchas.cl",
                Rol = "Cliente",
                FechaCreacion = DateTime.UtcNow
            };
            clienteUser.PasswordHash = auth.HashPassword(clienteUser, password);

            db.Usuarios.AddRange(adminUser, trabajadorUser, clienteUser);
            await db.SaveChangesAsync();

            // 5. Registro en Trabajador
            var trabajadorEntidad = new Trabajador
            {
                UsuarioId = trabajadorUser.Id,
                Cargo = "Encargado de Canchas",
                Turno = "Mañana"
            };
            db.Trabajadores.Add(trabajadorEntidad);
            await db.SaveChangesAsync();

            logger.LogInformation("DevSeeder: Datos de desarrollo inicializados correctamente (3 roles, 2 sedes, 3 tipos, 8 canchas).");
        }
    }
}
