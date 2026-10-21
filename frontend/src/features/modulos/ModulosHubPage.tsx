import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCanchas } from '../canchas/useCanchasQuery';
import {
  useSedesList,
  useReservasList,
  useCrearReserva,
  usePagosList,
  useComprobantesList,
  useMantenimientosList,
  useResenasList,
  useNotificacionesList,
  useTrabajadoresList,
  useUsuariosList,
  useHorariosList,
} from './useModulosQuery';

type ModuloTab =
  | 'sedes'
  | 'reservas'
  | 'pagos'
  | 'comprobantes'
  | 'horarios'
  | 'mantenimientos'
  | 'resenas'
  | 'notificaciones'
  | 'trabajadores'
  | 'usuarios';

export const ModulosHubPage: React.FC = () => {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'Administrador';
  const esTrabajador = usuario?.rol === 'Trabajador';
  const [tabActiva, setTabActiva] = useState<ModuloTab>('sedes');

  // Queries de datos
  const canchasQuery = useCanchas();
  const sedesQuery = useSedesList();
  const reservasQuery = useReservasList();
  const crearReservaMutation = useCrearReserva();
  const pagosQuery = usePagosList();
  const comprobantesQuery = useComprobantesList();
  const horariosQuery = useHorariosList();
  const mantenimientosQuery = useMantenimientosList();
  const resenasQuery = useResenasList();
  const notificacionesQuery = useNotificacionesList();
  const trabajadoresQuery = useTrabajadoresList();
  const usuariosQuery = useUsuariosList();

  // Estados para creación de reservas
  const [mostrarFormReserva, setMostrarFormReserva] = useState(false);
  const [reservaCanchaId, setReservaCanchaId] = useState<number>(1);
  const [reservaInicio, setReservaInicio] = useState<string>('');
  const [reservaFin, setReservaFin] = useState<string>('');
  const [errorReserva, setErrorReserva] = useState<string | null>(null);
  const [exitoReserva, setExitoReserva] = useState<string | null>(null);

  const handleCrearReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorReserva(null);
    setExitoReserva(null);

    const canchaSeleccionadaId = Number(reservaCanchaId) || canchasQuery.data?.[0]?.id || 1;

    if (!reservaInicio || !reservaFin) {
      setErrorReserva('Ingresa las fechas y horas de inicio y término.');
      return;
    }
    if (new Date(reservaInicio) >= new Date(reservaFin)) {
      setErrorReserva('La fecha de inicio debe ser anterior a la de término.');
      return;
    }

    try {
      await crearReservaMutation.mutateAsync({
        canchaId: canchaSeleccionadaId,
        fechaInicio: new Date(reservaInicio).toISOString(),
        fechaFin: new Date(reservaFin).toISOString(),
      });
      setExitoReserva('¡Reserva creada exitosamente!');
      setReservaInicio('');
      setReservaFin('');
      setTimeout(() => {
        setMostrarFormReserva(false);
        setExitoReserva(null);
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorReserva(errorObj?.message || 'Error al crear la reserva. Verifica que la cancha no esté ocupada.');
    }
  };

  const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="modulos-hub-page">
      <header className="page-header">
        <div>
          <nav aria-label="Ruta de navegación" className="breadcrumb">
            <Link to="/">Canchas</Link> / <span>Módulos del Sistema</span>
          </nav>
          <h1>Centro de Gestión Integral</h1>
          <p>
            Visualización y auditoría de todos los modelos y recursos expuestos por la API RESTful.
          </p>
        </div>
        <div>
          <Link to="/" className="btn btn-outline">
            ← Volver a Canchas
          </Link>
        </div>
      </header>

      {/* Navegación por Pestañas Accesibles */}
      <nav className="tabs-navigation" aria-label="Navegación de módulos del sistema">
        <ul className="tabs-list" role="tablist">
          <li role="presentation">
            <button
              type="button"
              role="tab"
              id="tab-sedes"
              aria-selected={tabActiva === 'sedes'}
              aria-controls="panel-sedes"
              className={`tab-button ${tabActiva === 'sedes' ? 'active' : ''}`}
              onClick={() => setTabActiva('sedes')}
            >
              🏢 Sedes ({sedesQuery.data?.length ?? 0})
            </button>
          </li>
          <li role="presentation">
            <button
              type="button"
              role="tab"
              id="tab-reservas"
              aria-selected={tabActiva === 'reservas'}
              aria-controls="panel-reservas"
              className={`tab-button ${tabActiva === 'reservas' ? 'active' : ''}`}
              onClick={() => setTabActiva('reservas')}
            >
              📅 Reservas ({reservasQuery.data?.length ?? 0})
            </button>
          </li>
          <li role="presentation">
            <button
              type="button"
              role="tab"
              id="tab-pagos"
              aria-selected={tabActiva === 'pagos'}
              aria-controls="panel-pagos"
              className={`tab-button ${tabActiva === 'pagos' ? 'active' : ''}`}
              onClick={() => setTabActiva('pagos')}
            >
              💳 Pagos ({pagosQuery.data?.length ?? 0})
            </button>
          </li>
          <li role="presentation">
            <button
              type="button"
              role="tab"
              id="tab-comprobantes"
              aria-selected={tabActiva === 'comprobantes'}
              aria-controls="panel-comprobantes"
              className={`tab-button ${tabActiva === 'comprobantes' ? 'active' : ''}`}
              onClick={() => setTabActiva('comprobantes')}
            >
              📄 Comprobantes ({comprobantesQuery.data?.length ?? 0})
            </button>
          </li>
          <li role="presentation">
            <button
              type="button"
              role="tab"
              id="tab-horarios"
              aria-selected={tabActiva === 'horarios'}
              aria-controls="panel-horarios"
              className={`tab-button ${tabActiva === 'horarios' ? 'active' : ''}`}
              onClick={() => setTabActiva('horarios')}
            >
              ⏰ Horarios ({horariosQuery.data?.length ?? 0})
            </button>
          </li>
          <li role="presentation">
            <button
              type="button"
              role="tab"
              id="tab-mantenimientos"
              aria-selected={tabActiva === 'mantenimientos'}
              aria-controls="panel-mantenimientos"
              className={`tab-button ${tabActiva === 'mantenimientos' ? 'active' : ''}`}
              onClick={() => setTabActiva('mantenimientos')}
            >
              🔧 Mantenimientos ({mantenimientosQuery.data?.length ?? 0})
            </button>
          </li>
          <li role="presentation">
            <button
              type="button"
              role="tab"
              id="tab-resenas"
              aria-selected={tabActiva === 'resenas'}
              aria-controls="panel-resenas"
              className={`tab-button ${tabActiva === 'resenas' ? 'active' : ''}`}
              onClick={() => setTabActiva('resenas')}
            >
              ⭐ Reseñas ({resenasQuery.data?.length ?? 0})
            </button>
          </li>
          <li role="presentation">
            <button
              type="button"
              role="tab"
              id="tab-notificaciones"
              aria-selected={tabActiva === 'notificaciones'}
              aria-controls="panel-notificaciones"
              className={`tab-button ${tabActiva === 'notificaciones' ? 'active' : ''}`}
              onClick={() => setTabActiva('notificaciones')}
            >
              🔔 Notificaciones ({notificacionesQuery.data?.length ?? 0})
            </button>
          </li>

          {esAdmin && (
            <>
              <li role="presentation">
                <button
                  type="button"
                  role="tab"
                  id="tab-trabajadores"
                  aria-selected={tabActiva === 'trabajadores'}
                  aria-controls="panel-trabajadores"
                  className={`tab-button ${tabActiva === 'trabajadores' ? 'active' : ''}`}
                  onClick={() => setTabActiva('trabajadores')}
                >
                  👷 Trabajadores ({trabajadoresQuery.data?.length ?? 0})
                </button>
              </li>
              <li role="presentation">
                <button
                  type="button"
                  role="tab"
                  id="tab-usuarios"
                  aria-selected={tabActiva === 'usuarios'}
                  aria-controls="panel-usuarios"
                  className={`tab-button ${tabActiva === 'usuarios' ? 'active' : ''}`}
                  onClick={() => setTabActiva('usuarios')}
                >
                  👥 Usuarios ({usuariosQuery.data?.length ?? 0})
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Contenido de cada Módulo */}
      <div className="tab-content-container">
        {/* 1. SEDES */}
        {tabActiva === 'sedes' && (
          <section id="panel-sedes" role="tabpanel" aria-labelledby="tab-sedes">
            <div className="section-title-bar">
              <h2>Sedes del Recinto Deportivo</h2>
              <span className="text-muted text-sm">Endpoints: GET /api/v1/sedes</span>
            </div>
            {sedesQuery.isLoading && (
              <div className="loading-container">
                <span className="spinner" aria-hidden="true" />
                <span>Cargando sedes...</span>
              </div>
            )}
            {sedesQuery.data && sedesQuery.data.length > 0 && (
              <div className="cards-grid">
                {sedesQuery.data.map((sede) => (
                  <article key={sede.id} className="cancha-card">
                    <header className="card-header">
                      <div>
                        <span className="card-id-tag">ID #{sede.id}</span>
                        <h3>{sede.nombre}</h3>
                      </div>
                    </header>
                    <div className="card-body">
                      <p>
                        📍 <strong>Dirección:</strong> {sede.direccion}
                      </p>
                      <p>
                        📞 <strong>Teléfono:</strong> {sede.telefono || 'Sin teléfono registrado'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. RESERVAS */}
        {tabActiva === 'reservas' && (
          <section id="panel-reservas" role="tabpanel" aria-labelledby="tab-reservas">
            <div className="section-title-bar">
              <div>
                <h2>Reservas de Canchas</h2>
                <span className="text-muted text-sm">Endpoints: GET & POST /api/v1/reservas (OWASP BOLA)</span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setMostrarFormReserva((prev) => !prev)}
              >
                {mostrarFormReserva ? 'Cerrar Formulario' : '+ Nueva Reserva'}
              </button>
            </div>

            {/* Formulario Integrado para Crear Reserva */}
            {mostrarFormReserva && (
              <form
                onSubmit={handleCrearReserva}
                className="form-card"
                style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)' }}>
                  Registrar Nueva Reserva
                </h3>

                {errorReserva && (
                  <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
                    {errorReserva}
                  </div>
                )}
                {exitoReserva && (
                  <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
                    {exitoReserva}
                  </div>
                )}

                <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="reserva-cancha">Seleccionar Cancha</label>
                    <select
                      id="reserva-cancha"
                      value={reservaCanchaId}
                      onChange={(e) => setReservaCanchaId(Number(e.target.value))}
                    >
                      {canchasQuery.data?.map((c) => (
                        <option key={c.id} value={c.id}>
                          Cancha {c.numero} – {c.sedeNombre} ({c.tipoCanchaNombre} - ${c.precioPorHora.toLocaleString('es-CL')}/hr)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reserva-inicio">Fecha y Hora de Inicio</label>
                    <input
                      id="reserva-inicio"
                      type="datetime-local"
                      value={reservaInicio}
                      onChange={(e) => setReservaInicio(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reserva-fin">Fecha y Hora de Fin</label>
                    <input
                      id="reserva-fin"
                      type="datetime-local"
                      value={reservaFin}
                      onChange={(e) => setReservaFin(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setMostrarFormReserva(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={crearReservaMutation.isPending}
                  >
                    {crearReservaMutation.isPending ? 'Guardando Reserva...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </form>
            )}
            {reservasQuery.isLoading && (
              <div className="loading-container">
                <span className="spinner" aria-hidden="true" />
                <span>Cargando reservas...</span>
              </div>
            )}
            {reservasQuery.data && reservasQuery.data.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📅</span>
                <h3>No hay reservas registradas</h3>
                <p>Las reservas realizadas por usuarios se listarán en este panel.</p>
              </div>
            )}
            {reservasQuery.data && reservasQuery.data.length > 0 && (
              <div className="table-responsive">
                <table className="data-table" aria-label="Tabla de Reservas">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Cancha</th>
                      <th scope="col">Usuario</th>
                      <th scope="col">Inicio</th>
                      <th scope="col">Fin</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservasQuery.data.map((r) => (
                      <tr key={r.id}>
                        <td className="font-mono text-muted">#{r.id}</td>
                        <td className="font-bold">Cancha {r.canchaNumero || r.canchaId}</td>
                        <td>{r.usuarioNombre || `Usuario #${r.usuarioId}`}</td>
                        <td>{new Date(r.fechaInicio).toLocaleString('es-CL')}</td>
                        <td>{new Date(r.fechaFin).toLocaleString('es-CL')}</td>
                        <td>
                          <span className={`badge badge-${r.estado.toLowerCase()}`}>{r.estado}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* 3. PAGOS */}
        {tabActiva === 'pagos' && (
          <section id="panel-pagos" role="tabpanel" aria-labelledby="tab-pagos">
            <div className="section-title-bar">
              <h2>Registro de Pagos</h2>
              <span className="text-muted text-sm">Endpoints: GET /api/v1/pagos</span>
            </div>
            {pagosQuery.isLoading && (
              <div className="loading-container">
                <span className="spinner" aria-hidden="true" />
                <span>Cargando pagos...</span>
              </div>
            )}
            {pagosQuery.data && pagosQuery.data.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">💳</span>
                <h3>Sin transacciones registradas</h3>
              </div>
            )}
            {pagosQuery.data && pagosQuery.data.length > 0 && (
              <div className="table-responsive">
                <table className="data-table" aria-label="Tabla de Pagos">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Reserva</th>
                      <th scope="col">Cliente</th>
                      <th scope="col">Monto</th>
                      <th scope="col">Método</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagosQuery.data.map((p) => (
                      <tr key={p.id}>
                        <td className="font-mono text-muted">#{p.id}</td>
                        <td>Reserva #{p.reservaId}</td>
                        <td>{p.usuarioNombre || 'Cliente'}</td>
                        <td className="font-bold">${p.monto.toLocaleString('es-CL')}</td>
                        <td>{p.metodoPago}</td>
                        <td>
                          <span className={`badge badge-${p.estado.toLowerCase()}`}>{p.estado}</span>
                        </td>
                        <td>{p.fechaPago ? new Date(p.fechaPago).toLocaleDateString('es-CL') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* 4. COMPROBANTES */}
        {tabActiva === 'comprobantes' && (
          <section id="panel-comprobantes" role="tabpanel" aria-labelledby="tab-comprobantes">
            <div className="section-title-bar">
              <h2>Comprobantes Electrónicos (Boletas / Facturas)</h2>
              <span className="text-muted text-sm">Endpoints: GET /api/v1/comprobantes</span>
            </div>
            {comprobantesQuery.isLoading && (
              <div className="loading-container">
                <span className="spinner" aria-hidden="true" />
                <span>Cargando comprobantes...</span>
              </div>
            )}
            {comprobantesQuery.data && comprobantesQuery.data.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📄</span>
                <h3>No hay comprobantes emitidos</h3>
              </div>
            )}
            {comprobantesQuery.data && comprobantesQuery.data.length > 0 && (
              <div className="table-responsive">
                <table className="data-table" aria-label="Tabla de Comprobantes">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">N° Comprobante</th>
                      <th scope="col">Tipo</th>
                      <th scope="col">Pago Asociado</th>
                      <th scope="col">Monto</th>
                      <th scope="col">Emisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprobantesQuery.data.map((c) => (
                      <tr key={c.id}>
                        <td className="font-mono text-muted">#{c.id}</td>
                        <td className="font-bold">{c.numeroComprobante}</td>
                        <td>
                          <span className="badge badge-disponible">{c.tipo}</span>
                        </td>
                        <td>Pago #{c.pagoId}</td>
                        <td className="font-bold">
                          {c.monto ? `$${c.monto.toLocaleString('es-CL')}` : '—'}
                        </td>
                        <td>{new Date(c.fechaEmision).toLocaleDateString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* 5. HORARIOS */}
        {tabActiva === 'horarios' && (
          <section id="panel-horarios" role="tabpanel" aria-labelledby="tab-horarios">
            <div className="section-title-bar">
              <h2>Horarios de Funcionamiento</h2>
              <span className="text-muted text-sm">Endpoints: GET /api/v1/horarios</span>
            </div>
            {horariosQuery.isLoading && (
              <div className="loading-container">
                <span className="spinner" aria-hidden="true" />
                <span>Cargando horarios...</span>
              </div>
            )}
            {horariosQuery.data && horariosQuery.data.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">⏰</span>
                <h3>Sin horarios programados</h3>
              </div>
            )}
            {horariosQuery.data && horariosQuery.data.length > 0 && (
              <div className="cards-grid">
                {horariosQuery.data.map((h) => (
                  <article key={h.id} className="cancha-card">
                    <header className="card-header">
                      <div>
                        <span className="card-id-tag font-mono">ID #{h.id}</span>
                        <h3>Cancha {h.canchaNumero || h.canchaId}</h3>
                      </div>
                      <span className="badge badge-disponible">
                        {diasSemana[h.diaSemana] || `Día ${h.diaSemana}`}
                      </span>
                    </header>
                    <div className="card-body">
                      <p>
                        🕒 <strong>Apertura:</strong> {h.horaApertura}
                      </p>
                      <p>
                        🔒 <strong>Cierre:</strong> {h.horaCierre}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 6. MANTENIMIENTOS */}
        {tabActiva === 'mantenimientos' && (
          <section id="panel-mantenimientos" role="tabpanel" aria-labelledby="tab-mantenimientos">
            <div className="section-title-bar">
              <h2>Bitácora de Mantenimientos</h2>
              <span className="text-muted text-sm">Endpoints: GET /api/v1/mantenimientos</span>
            </div>
            {!esAdmin && !esTrabajador ? (
              <div className="alert alert-warning">
                Requiere privilegios de Trabajador o Administrador para consultar mantenimientos.
              </div>
            ) : mantenimientosQuery.isLoading ? (
              <div className="loading-container">
                <span className="spinner" aria-hidden="true" />
                <span>Cargando bitácora de mantenimientos...</span>
              </div>
            ) : mantenimientosQuery.data && mantenimientosQuery.data.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔧</span>
                <h3>Sin mantenimientos programados</h3>
              </div>
            ) : (
              <div className="cards-grid">
                {mantenimientosQuery.data?.map((m) => (
                  <article key={m.id} className="cancha-card">
                    <header className="card-header">
                      <div>
                        <span className="card-id-tag">ID #{m.id}</span>
                        <h3>Cancha {m.canchaNumero || m.canchaId}</h3>
                      </div>
                      <span className="badge badge-mantenimiento">Mantenimiento</span>
                    </header>
                    <div className="card-body">
                      <p>
                        <strong>Descripción:</strong> {m.descripcion}
                      </p>
                      <p>
                        👷 <strong>Técnico:</strong> {m.trabajadorNombre || `ID #${m.trabajadorId}`}
                      </p>
                      <p>
                        📅 <strong>Inicio:</strong> {new Date(m.fechaInicio).toLocaleDateString('es-CL')}
                      </p>
                      {m.fechaFin && (
                        <p>
                          🏁 <strong>Fin estimado:</strong>{' '}
                          {new Date(m.fechaFin).toLocaleDateString('es-CL')}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 7. RESEÑAS */}
        {tabActiva === 'resenas' && (
          <section id="panel-resenas" role="tabpanel" aria-labelledby="tab-resenas">
            <div className="section-title-bar">
              <h2>Reseñas y Calificaciones de Clientes</h2>
              <span className="text-muted text-sm">Endpoints: GET /api/v1/resenas</span>
            </div>
            {resenasQuery.isLoading && (
              <div className="loading-container">
                <span className="spinner" aria-hidden="true" />
                <span>Cargando opiniones de clientes...</span>
              </div>
            )}
            {resenasQuery.data && resenasQuery.data.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">⭐</span>
                <h3>Sin reseñas registradas aún</h3>
              </div>
            )}
            {resenasQuery.data && resenasQuery.data.length > 0 && (
              <div className="cards-grid">
                {resenasQuery.data.map((r) => (
                  <article key={r.id} className="cancha-card">
                    <header className="card-header">
                      <div>
                        <span className="card-id-tag font-mono">ID #{r.id}</span>
                        <h3>{r.usuarioNombre || 'Cliente'}</h3>
                      </div>
                      <span className="badge badge-administrador">
                        {'★'.repeat(r.calificacion)}
                        {'☆'.repeat(5 - r.calificacion)} ({r.calificacion}/5)
                      </span>
                    </header>
                    <div className="card-body">
                      <p className="resena-comment">"{r.comentario || 'Sin comentario escrito.'}"</p>
                      <p className="text-muted text-xs">
                        Cancha {r.canchaNumero || r.canchaId} |{' '}
                        {new Date(r.fecha).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 8. NOTIFICACIONES */}
        {tabActiva === 'notificaciones' && (
          <section id="panel-notificaciones" role="tabpanel" aria-labelledby="tab-notificaciones">
            <div className="section-title-bar">
              <h2>Centro de Notificaciones</h2>
              <span className="text-muted text-sm">Endpoints: GET /api/v1/notificaciones</span>
            </div>
            {notificacionesQuery.isLoading && (
              <div className="loading-container">
                <span className="spinner" aria-hidden="true" />
                <span>Cargando notificaciones...</span>
              </div>
            )}
            {notificacionesQuery.data && notificacionesQuery.data.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">🔔</span>
                <h3>No tienes notificaciones pendientes</h3>
              </div>
            )}
            {notificacionesQuery.data && notificacionesQuery.data.length > 0 && (
              <div className="notifications-list">
                {notificacionesQuery.data.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-item ${n.leido ? 'read' : 'unread'}`}
                  >
                    <div className="notification-content">
                      <p className="notification-message">{n.mensaje}</p>
                      <span className="notification-date text-muted text-xs">
                        {new Date(n.fechaEnvio).toLocaleString('es-CL')}
                      </span>
                    </div>
                    <span className={`badge ${n.leido ? 'badge-fuera-de-servicio' : 'badge-disponible'}`}>
                      {n.leido ? 'Leída' : 'Nueva'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 9. TRABAJADORES (Admin Only) */}
        {tabActiva === 'trabajadores' && esAdmin && (
          <section id="panel-trabajadores" role="tabpanel" aria-labelledby="tab-trabajadores">
            <div className="section-title-bar">
              <h2>Equipo de Trabajadores</h2>
              <span className="text-muted text-sm">Endpoints: GET /api/v1/trabajadores (Admin)</span>
            </div>
            {trabajadoresQuery.isLoading && (
              <div className="loading-container">
                <span className="spinner" aria-hidden="true" />
                <span>Cargando personal...</span>
              </div>
            )}
            {trabajadoresQuery.data && (
              <div className="table-responsive">
                <table className="data-table" aria-label="Tabla de Trabajadores">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Email</th>
                      <th scope="col">Cargo</th>
                      <th scope="col">Turno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trabajadoresQuery.data.map((t) => (
                      <tr key={t.id}>
                        <td className="font-mono text-muted">#{t.id}</td>
                        <td className="font-bold">{t.nombre || 'Personal'}</td>
                        <td>{t.email || '—'}</td>
                        <td>
                          <span className="badge badge-trabajador">{t.cargo}</span>
                        </td>
                        <td>{t.turno}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* 10. USUARIOS (Admin Only) */}
        {tabActiva === 'usuarios' && esAdmin && (
          <section id="panel-usuarios" role="tabpanel" aria-labelledby="tab-usuarios">
            <div className="section-title-bar">
              <h2>Usuarios Registrados en el Sistema</h2>
              <span className="text-muted text-sm">Endpoints: GET /api/v1/usuarios (Admin)</span>
            </div>
            {usuariosQuery.isLoading && (
              <div className="loading-container">
                <span className="spinner" aria-hidden="true" />
                <span>Cargando usuarios...</span>
              </div>
            )}
            {usuariosQuery.data && (
              <div className="table-responsive">
                <table className="data-table" aria-label="Tabla de Usuarios">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Email</th>
                      <th scope="col">Rol</th>
                      <th scope="col">Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosQuery.data.map((u) => (
                      <tr key={u.id}>
                        <td className="font-mono text-muted">#{u.id}</td>
                        <td className="font-bold">{u.nombre}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge badge-${u.rol.toLowerCase()}`}>{u.rol}</span>
                        </td>
                        <td>{new Date(u.fechaCreacion).toLocaleDateString('es-CL')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
export default ModulosHubPage;
