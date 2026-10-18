using CanchasApi.Endpoints;
using CanchasApi.Middleware;
using CanchasApi.Models;
using CanchasApi.Repositories;
using CanchasApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
//cargamos todo lo referente los jwt
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
    throw new InvalidOperationException("Falta configurar 'Jwt:Key'. Definela con dotnet user-secrets (ver README) o como variable de entorno; nunca hardcodeada en el código.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudince = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(1),
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudince,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey))

            };
        });
builder.Services.AddAuthorization();
// conexión a la db
builder.Services.AddDbContext<ReservasCanchasDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("miconexion")));
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
//invocamos la clase de autenticación 
builder.Services.AddScoped<AuthService>();

// Patrón Repository: repositorio genérico para cualquier entidad,
// y repositorios específicos cuando la entidad necesita consultas propias.
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();

// Configuración de CORS con orígenes explícitos (prohibido AllowAnyOrigin)
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
if (allowedOrigins is null || allowedOrigins.Length == 0)
{
    allowedOrigins = new[] { "https://localhost:5173" };
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
              .WithHeaders("Authorization", "Content-Type", "Accept");
    });
});

// Rate limiting para mitigar ataques de fuerza bruta en login (configurable para tests)
var loginPermitLimit = int.TryParse(builder.Configuration["RateLimiting:LoginPermitLimit"], out var limit) ? limit : 5;

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("login", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = loginPermitLimit,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });
});

var app = builder.Build();

// Middleware de cabeceras de seguridad HTTP
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? string.Empty;
    var isDevDoc = app.Environment.IsDevelopment() &&
        (path.StartsWith("/scalar", StringComparison.OrdinalIgnoreCase) ||
         path.StartsWith("/openapi", StringComparison.OrdinalIgnoreCase) ||
         path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase));

    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";

    if (!isDevDoc)
    {
        context.Response.Headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";
    }

    await next();
});

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler(exceptionHandlerApp =>
    {
        exceptionHandlerApp.Run(async context =>
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/problem+json";
            var problem = new
            {
                type = "https://tools.ietf.org/html/rfc9110#section-15.6.1",
                title = "Error interno del servidor",
                status = StatusCodes.Status500InternalServerError,
                detail = "Ocurrió un error inesperado al procesar la solicitud."
            };
            await context.Response.WriteAsJsonAsync(problem);
        });
    });
    app.UseHsts();
}

app.UseRequestLogging(); // middleware propio: registra método, ruta, status y duración
app.UseCors("FrontendPolicy"); // CORS debe ejecutarse antes de la autenticación
app.UseRateLimiter(); // Aplica limitación de tasa antes de autenticación/endpoints
app.UseAuthentication(); // ¿quién es?
app.UseAuthorization(); // ¿qué puede hacer?

// Endpoint para comprobar conexión a la base de datos (sin filtrar trazas internas)
app.MapGet("/health", async (ReservasCanchasDbContext db, ILogger<Program> logger) =>
{
    try
    {
        var canConnect = await db.Database.CanConnectAsync();
        if (canConnect)
            return Results.Ok(new { database = "connected" });
        return Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error al comprobar la salud de la base de datos");
        return Results.Problem(
            detail: "No se pudo conectar con el servicio de base de datos.",
            statusCode: StatusCodes.Status503ServiceUnavailable,
            title: "Servicio no disponible"
        );
    }
});
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.MapOpenApi();
    app.MapScalarApiReference();
    app.MapGet("/", () => Results.Redirect("/scalar/v1"));
    app.MapGet("/scalar", () => Results.Redirect("/scalar/v1"));
    app.MapGet("/swagger", () => Results.Redirect("/scalar/v1"));

    // Sembrado de datos para pruebas locales y demostración
    await DevSeeder.SeedAsync(app.Services, app.Configuration, app.Logger);
}

app.UseHttpsRedirection();

// Creación de EndPoints
app.MapUsuarioApi();
app.MapTrabajadorApi();
app.MapSedeApi();
app.MapTipoCanchaApi();
app.MapCanchaApi();
app.MapHorarioApi();
app.MapReservaApi();
app.MapPagoApi();
app.MapComprobanteApi();
app.MapResenaApi();
app.MapMantenimientoApi();
app.MapNotificacionApi();

app.Run();

// Necesario para que WebApplicationFactory<Program> (proyecto de pruebas de integración)
// pueda referenciar esta clase Program generada por los top-level statements.
public partial class Program { }
