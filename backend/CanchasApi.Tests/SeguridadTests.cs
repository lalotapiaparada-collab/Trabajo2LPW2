using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace CanchasApi.Tests
{
    public class SeguridadTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;

        public SeguridadTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Login_ConPasswordIncorrecto_Retorna401Unauthorized()
        {
            var email = $"usuario.{Guid.NewGuid():N}@test.com";
            await _factory.CrearUsuarioAsync("Usuario Clave", email, "ClaveCorrecta123!", "Cliente");

            using var client = _factory.CreateClient();
            var response = await client.PostAsJsonAsync("/api/v1/usuarios/login",
                new { Email = email, Password = "ClaveErronea123!" });

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task PreflightCors_ConOrigenPermitido_RetornaAccessControlAllowOrigin()
        {
            using var client = _factory.CreateClient();
            using var request = new HttpRequestMessage(HttpMethod.Options, "/api/v1/canchas");
            request.Headers.Add("Origin", "https://localhost:5173");
            request.Headers.Add("Access-Control-Request-Method", "GET");

            using var response = await client.SendAsync(request);

            Assert.True(response.Headers.Contains("Access-Control-Allow-Origin"));
        }

        [Fact]
        public async Task PreflightCors_ConOrigenNoPermitido_NoRetornaAccessControlAllowOrigin()
        {
            using var client = _factory.CreateClient();
            using var request = new HttpRequestMessage(HttpMethod.Options, "/api/v1/canchas");
            request.Headers.Add("Origin", "https://sitio-malicioso.com");
            request.Headers.Add("Access-Control-Request-Method", "GET");

            using var response = await client.SendAsync(request);

            Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
        }

        [Fact]
        public async Task RateLimiting_TrasSuperarLimiteEnLogin_Retorna429TooManyRequests()
        {
            // Creamos un cliente con límite estricto de 3 intentos
            var clientConLimite = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((_, config) =>
                {
                    config.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["RateLimiting:LoginPermitLimit"] = "3"
                    });
                });
            }).CreateClient();

            HttpResponseMessage? ultimaRespuesta = null;
            for (int i = 0; i < 4; i++)
            {
                ultimaRespuesta = await clientConLimite.PostAsJsonAsync("/api/v1/usuarios/login",
                    new { Email = "intento@test.com", Password = "ClaveCualquiera123!" });
            }

            Assert.Equal(HttpStatusCode.TooManyRequests, ultimaRespuesta!.StatusCode);
        }

        [Fact]
        public async Task CabecerasSeguridad_EnRespuestasHttp_EstanPresentes()
        {
            using var client = _factory.CreateClient();

            var response = await client.GetAsync("/health");

            Assert.True(response.Headers.Contains("X-Content-Type-Options") &&
                        response.Headers.Contains("X-Frame-Options") &&
                        response.Headers.Contains("Referrer-Policy"));
        }

        [Fact]
        public async Task Usuarios_ClientePidiendoUsuarioAjeno_Retorna403Forbidden()
        {
            var (clienteAutenticado, usuarioPropio, _) = await _factory.CrearClienteAutenticadoAsync("Cliente");
            var usuarioAjeno = await _factory.CrearUsuarioAsync("Usuario Victima",
                $"victima.{Guid.NewGuid():N}@test.com", "ClaveSegura123!", "Cliente");

            var response = await clienteAutenticado.GetAsync($"/api/v1/usuarios/{usuarioAjeno.Id}");

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task Registro_ConPasswordMenorDe8Caracteres_Retorna400BadRequest()
        {
            using var client = _factory.CreateClient();
            var payload = new
            {
                Nombre = "Usuario Corto",
                Email = $"corto.{Guid.NewGuid():N}@test.com",
                Password = "123", // Menos de 8 caracteres
                Rol = (string?)null
            };

            var response = await client.PostAsJsonAsync("/api/v1/usuarios/registro", payload);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}
