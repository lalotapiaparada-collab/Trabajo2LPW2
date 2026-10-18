using CanchasApi.Models;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace CanchasApi.Tests
{
    public class CanchasAutorizacionTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly CustomWebApplicationFactory _factory;

        public CanchasAutorizacionTests(CustomWebApplicationFactory factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task CrearCancha_SinToken_Retorna401Unauthorized()
        {
            using var client = _factory.CreateClient();
            var payload = new { Numero = 101, SedeId = 1, TipoCanchaId = 1, Estado = "Disponible" };

            var response = await client.PostAsJsonAsync("/api/v1/canchas", payload);

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task CrearCancha_ConRolCliente_Retorna403Forbidden()
        {
            var (client, _, _) = await _factory.CrearClienteAutenticadoAsync("Cliente");
            var (sedeId, tipoCanchaId) = await _factory.AsegurarSedeYTipoAsync();
            var payload = new { Numero = 102, SedeId = sedeId, TipoCanchaId = tipoCanchaId, Estado = "Disponible" };

            var response = await client.PostAsJsonAsync("/api/v1/canchas", payload);

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task CrearCancha_ConRolTrabajador_Retorna201Created()
        {
            var (client, _, _) = await _factory.CrearClienteAutenticadoAsync("Trabajador");
            var (sedeId, tipoCanchaId) = await _factory.AsegurarSedeYTipoAsync();
            var payload = new { Numero = 103, SedeId = sedeId, TipoCanchaId = tipoCanchaId, Estado = "Disponible" };

            var response = await client.PostAsJsonAsync("/api/v1/canchas", payload);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task EliminarCancha_ConRolTrabajador_Retorna403Forbidden()
        {
            var (trabajadorClient, _, _) = await _factory.CrearClienteAutenticadoAsync("Trabajador");
            var (adminClient, _, _) = await _factory.CrearClienteAutenticadoAsync("Administrador");
            var (sedeId, tipoCanchaId) = await _factory.AsegurarSedeYTipoAsync();

            // Administrador crea la cancha
            var createRes = await adminClient.PostAsJsonAsync("/api/v1/canchas",
                new { Numero = 104, SedeId = sedeId, TipoCanchaId = tipoCanchaId, Estado = "Disponible" });
            var creada = await createRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
            var canchaId = creada.GetProperty("id").GetInt32();

            // Trabajador intenta eliminarla
            var response = await trabajadorClient.DeleteAsync($"/api/v1/canchas/{canchaId}");

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [Fact]
        public async Task EliminarCancha_ConRolAdministrador_Retorna204NoContent()
        {
            var (adminClient, _, _) = await _factory.CrearClienteAutenticadoAsync("Administrador");
            var (sedeId, tipoCanchaId) = await _factory.AsegurarSedeYTipoAsync();

            var createRes = await adminClient.PostAsJsonAsync("/api/v1/canchas",
                new { Numero = 105, SedeId = sedeId, TipoCanchaId = tipoCanchaId, Estado = "Disponible" });
            var creada = await createRes.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
            var canchaId = creada.GetProperty("id").GetInt32();

            var response = await adminClient.DeleteAsync($"/api/v1/canchas/{canchaId}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }
    }
}
