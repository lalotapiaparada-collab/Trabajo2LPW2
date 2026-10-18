using CanchasApi.Models;

namespace CanchasApi.Repositories
{
    /// <summary>
    /// Extiende el repositorio genérico con consultas propias de Usuario
    /// (las que antes vivían como LINQ directo sobre el DbContext en el endpoint).
    /// </summary>
    public interface IUsuarioRepository : IRepository<Usuario>
    {
        Task<bool> ExisteEmailAsync(string email);
        Task<Usuario?> GetByEmailAsync(string email);
    }
}
