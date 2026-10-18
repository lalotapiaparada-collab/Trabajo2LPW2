using CanchasApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CanchasApi.Services
{
    /// <summary>
    /// Seeder exclusivo para el entorno de Desarrollo.
    /// Asegura de forma idempotente la existencia de los 3 usuarios de prueba (Admin, Trabajador, Cliente),
    /// sedes, tipos de cancha y canchas operativas para la demostración en vivo.
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

            // Contraseña unificada de prueba para desarrollo (o leída de configuración)
            var password = configuration["Seed:AdminPassword"];
            if (string.IsNullOrWhiteSpace(password))
            {
                password = "Password123!";
            }

            logger.LogInformation("DevSeeder: Verificando y sembrando datos de desarrollo...");

            // 1. Sedes
            if (!await db.Sedes.AnyAsync())
            {
                var sedeCentral = new Sede { Nombre = "Sede Central", Direccion = "Av. Libertador 1234", Telefono = "+56911112222" };
                var sedeNorte = new Sede { Nombre = "Sede Norte", Direccion = "Camino Norte 567", Telefono = "+56933334444" };
                db.Sedes.AddRange(sedeCentral, sedeNorte);
                await db.SaveChangesAsync();
            }

            // 2. Tipos de Cancha
            if (!await db.TiposCancha.AnyAsync())
            {
                var tipoFutbol = new TipoCancha { Nombre = "Fútbol 7", Descripcion = "Cancha de pasto sintético con iluminación LED", PrecioPorHora = 25000m };
                var tipoPadel = new TipoCancha { Nombre = "Pádel Techado", Descripcion = "Cancha de cristal templado techada con ventilación", PrecioPorHora = 18000m };
                var tipoTenis = new TipoCancha { Nombre = "Tenis Arcilla", Descripcion = "Cancha de arcilla tradicional para singles o dobles", PrecioPorHora = 15000m };
                db.TiposCancha.AddRange(tipoFutbol, tipoPadel, tipoTenis);
                await db.SaveChangesAsync();
            }

            // 3. Canchas
            if (!await db.Canchas.AnyAsync())
            {
                var primeraSede = await db.Sedes.FirstAsync();
                var segundaSede = await db.Sedes.Skip(1).FirstOrDefaultAsync() ?? primeraSede;
                var primerTipo = await db.TiposCancha.FirstAsync();
                var segundoTipo = await db.TiposCancha.Skip(1).FirstOrDefaultAsync() ?? primerTipo;

                var canchas = new List<Cancha>
                {
                    new Cancha { Numero = 1, SedeId = primeraSede.Id, TipoCanchaId = primerTipo.Id, Estado = "Disponible" },
                    new Cancha { Numero = 2, SedeId = primeraSede.Id, TipoCanchaId = primerTipo.Id, Estado = "Disponible" },
                    new Cancha { Numero = 3, SedeId = primeraSede.Id, TipoCanchaId = segundoTipo.Id, Estado = "Disponible" },
                    new Cancha { Numero = 4, SedeId = primeraSede.Id, TipoCanchaId = segundoTipo.Id, Estado = "Mantenimiento" },
                    new Cancha { Numero = 5, SedeId = segundaSede.Id, TipoCanchaId = primerTipo.Id, Estado = "Disponible" },
                    new Cancha { Numero = 6, SedeId = segundaSede.Id, TipoCanchaId = segundoTipo.Id, Estado = "Disponible" }
                };
                db.Canchas.AddRange(canchas);
                await db.SaveChangesAsync();
            }

            // 4. Asegurar los 3 Usuarios con sus roles y credenciales
            var adminUser = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == "admin@canchas.cl");
            if (adminUser == null)
            {
                adminUser = new Usuario
                {
                    Nombre = "Administrador Principal",
                    Email = "admin@canchas.cl",
                    Rol = "Administrador",
                    FechaCreacion = DateTime.UtcNow
                };
                adminUser.PasswordHash = auth.HashPassword(adminUser, password);
                db.Usuarios.Add(adminUser);
            }
            else
            {
                adminUser.Rol = "Administrador";
                adminUser.PasswordHash = auth.HashPassword(adminUser, password);
            }

            var trabajadorUser = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == "trabajador@canchas.cl");
            if (trabajadorUser == null)
            {
                trabajadorUser = new Usuario
                {
                    Nombre = "Trabajador Operativo",
                    Email = "trabajador@canchas.cl",
                    Rol = "Trabajador",
                    FechaCreacion = DateTime.UtcNow
                };
                trabajadorUser.PasswordHash = auth.HashPassword(trabajadorUser, password);
                db.Usuarios.Add(trabajadorUser);
            }
            else
            {
                trabajadorUser.Rol = "Trabajador";
                trabajadorUser.PasswordHash = auth.HashPassword(trabajadorUser, password);
            }

            var clienteUser = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == "cliente@canchas.cl");
            if (clienteUser == null)
            {
                clienteUser = new Usuario
                {
                    Nombre = "Cliente Demostración",
                    Email = "cliente@canchas.cl",
                    Rol = "Cliente",
                    FechaCreacion = DateTime.UtcNow
                };
                clienteUser.PasswordHash = auth.HashPassword(clienteUser, password);
                db.Usuarios.Add(clienteUser);
            }
            else
            {
                clienteUser.Rol = "Cliente";
                clienteUser.PasswordHash = auth.HashPassword(clienteUser, password);
            }

            await db.SaveChangesAsync();

            // 5. Asegurar entidad Trabajador
            if (!await db.Trabajadores.AnyAsync(t => t.UsuarioId == trabajadorUser.Id))
            {
                db.Trabajadores.Add(new Trabajador
                {
                    UsuarioId = trabajadorUser.Id,
                    Cargo = "Encargado de Canchas",
                    Turno = "Mañana"
                });
                await db.SaveChangesAsync();
            }

            logger.LogInformation("DevSeeder: Usuarios y datos de desarrollo asegurados correctamente con contraseña '{Password}'.", password);
        }
    }
}
