using CanchasApi.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CanchasApi.Tests
{
    /// <summary>
    /// WebApplicationFactory que arranca la API completa en memoria para los tests
    /// de integración, reemplazando SQL Server por un DbContext InMemory y
    /// definiendo una Jwt:Key de prueba (Program.cs exige que exista para arrancar).
    /// </summary>
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration((context, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Jwt:Key"] = "clave-de-pruebas-solo-para-tests-de-integracion-1234567890",
                    ["Jwt:Issuer"] = "CanchasApi.Tests",
                    ["Jwt:Audience"] = "CanchasApi.Tests",
                    ["RateLimiting:LoginPermitLimit"] = "100",
                    ["Cors:AllowedOrigins:0"] = "https://localhost:5173"
                });
            });

            builder.ConfigureServices(services =>
            {
                var descriptors = services.Where(d =>
                    d.ServiceType == typeof(DbContextOptions<ReservasCanchasDbContext>) ||
                    d.ServiceType == typeof(DbContextOptions) ||
                    d.ServiceType == typeof(ReservasCanchasDbContext)).ToList();

                foreach (var d in descriptors)
                    services.Remove(d);

                var internalServiceProvider = new ServiceCollection()
                    .AddEntityFrameworkInMemoryDatabase()
                    .BuildServiceProvider();

                services.AddDbContext<ReservasCanchasDbContext>(options =>
                {
                    options.UseInMemoryDatabase("CanchasApiTestsDb");
                    options.UseInternalServiceProvider(internalServiceProvider);
                });
            });
        }

        /// <summary>
        /// Inserta un usuario directamente en la base InMemory (permite roles Trabajador y Administrador).
        /// </summary>
        public async Task<Usuario> CrearUsuarioAsync(string nombre, string email, string password, string rol)
        {
            using var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ReservasCanchasDbContext>();
            var auth = scope.ServiceProvider.GetRequiredService<CanchasApi.Services.AuthService>();

            var usuario = new Usuario
            {
                Nombre = nombre,
                Email = email,
                Rol = rol,
                FechaCreacion = DateTime.UtcNow
            };
            usuario.PasswordHash = auth.HashPassword(usuario, password);

            db.Usuarios.Add(usuario);
            await db.SaveChangesAsync();
            return usuario;
        }

        /// <summary>
        /// Obtiene un token JWT real enviando credenciales a /api/v1/usuarios/login.
        /// </summary>
        public async Task<string> ObtenerTokenAsync(string email, string password)
        {
            using var client = CreateClient();
            var response = await System.Net.Http.Json.HttpClientJsonExtensions.PostAsJsonAsync(
                client, "/api/v1/usuarios/login", new { Email = email, Password = password });
            response.EnsureSuccessStatusCode();

            var json = await System.Net.Http.Json.HttpContentJsonExtensions.ReadFromJsonAsync<System.Text.Json.JsonElement>(response.Content);
            return json.GetProperty("token").GetString()!;
        }

        /// <summary>
        /// Crea un usuario con el rol indicado, obtiene su token y retorna un HttpClient con cabecera Authorization Bearer.
        /// </summary>
        public async Task<(HttpClient Client, Usuario Usuario, string Token)> CrearClienteAutenticadoAsync(string rol)
        {
            var email = $"{rol.ToLowerInvariant()}.{Guid.NewGuid():N}@test.com";
            var password = "ClaveSegura123!";
            var usuario = await CrearUsuarioAsync($"Usuario {rol}", email, password, rol);
            var token = await ObtenerTokenAsync(email, password);

            var client = CreateClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            return (client, usuario, token);
        }

        /// <summary>
        /// Asegura que existan al menos una Sede y un TipoCancha en la BD InMemory para pruebas de canchas.
        /// </summary>
        public async Task<(int SedeId, int TipoCanchaId)> AsegurarSedeYTipoAsync()
        {
            using var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ReservasCanchasDbContext>();

            var sede = await db.Sedes.FirstOrDefaultAsync();
            if (sede is null)
            {
                sede = new Sede { Nombre = "Sede Test", Direccion = "Calle 123", Telefono = "+56911112222" };
                db.Sedes.Add(sede);
                await db.SaveChangesAsync();
            }

            var tipo = await db.TiposCancha.FirstOrDefaultAsync();
            if (tipo is null)
            {
                tipo = new TipoCancha { Nombre = "Tipo Test", Descripcion = "Descripción test", PrecioPorHora = 10000m };
                db.TiposCancha.Add(tipo);
                await db.SaveChangesAsync();
            }

            return (sede.Id, tipo.Id);
        }
    }
}
