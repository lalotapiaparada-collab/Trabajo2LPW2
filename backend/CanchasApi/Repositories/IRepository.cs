namespace CanchasApi.Repositories
{
    /// <summary>
    /// Operaciones CRUD genéricas, comunes a cualquier entidad.
    /// Los repositorios específicos (ej. IUsuarioRepository) heredan de esta
    /// interfaz y agregan las consultas propias de su entidad.
    /// </summary>
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(int id);
        Task<List<T>> GetAllAsync();
        Task AddAsync(T entity);
        void Update(T entity);
        void Remove(T entity);
        Task<int> SaveChangesAsync();
    }
}
