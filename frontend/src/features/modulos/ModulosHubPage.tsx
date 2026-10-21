import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCanchas } from '../canchas/useCanchasQuery';
import {
  useSedesList,
  useCrearSede,
  useReservasList,
  useCrearReserva,
  usePagosList,
  useCrearPago,
  useComprobantesList,
  useCrearComprobante,
  useMantenimientosList,
  useCrearMantenimiento,
  useResenasList,
  useCrearResena,
  useNotificacionesList,
  useCrearNotificacion,
  useTrabajadoresList,
  useCrearTrabajador,
  useUsuariosList,
  useCrearUsuario,
  useHorariosList,
  useCrearHorario,
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
  const pagosQuery = usePagosList();
  const comprobantesQuery = useComprobantesList();
  const horariosQuery = useHorariosList();
  const mantenimientosQuery = useMantenimientosList();
  const resenasQuery = useResenasList();
  const notificacionesQuery = useNotificacionesList();
  const trabajadoresQuery = useTrabajadoresList();
  const usuariosQuery = useUsuariosList();

  // Mutations
  const crearSedeMutation = useCrearSede();
  const crearReservaMutation = useCrearReserva();
  const crearPagoMutation = useCrearPago();
  const crearComprobanteMutation = useCrearComprobante();
  const crearHorarioMutation = useCrearHorario();
  const crearMantenimientoMutation = useCrearMantenimiento();
  const crearResenaMutation = useCrearResena();
  const crearNotificacionMutation = useCrearNotificacion();
  const crearTrabajadorMutation = useCrearTrabajador();
  const crearUsuarioMutation = useCrearUsuario();

  // 1. Sedes Form State
  const [mostrarFormSede, setMostrarFormSede] = useState(false);
  const [sedeNombre, setSedeNombre] = useState('');
  const [sedeDireccion, setSedeDireccion] = useState('');
  const [sedeTelefono, setSedeTelefono] = useState('');
  const [errorSede, setErrorSede] = useState<string | null>(null);
  const [exitoSede, setExitoSede] = useState<string | null>(null);

  // 2. Reservas Form State
  const [mostrarFormReserva, setMostrarFormReserva] = useState(false);
  const [reservaCanchaId, setReservaCanchaId] = useState<number>(1);
  const [reservaInicio, setReservaInicio] = useState<string>('');
  const [reservaFin, setReservaFin] = useState<string>('');
  const [errorReserva, setErrorReserva] = useState<string | null>(null);
  const [exitoReserva, setExitoReserva] = useState<string | null>(null);

  // 3. Pagos Form State
  const [mostrarFormPago, setMostrarFormPago] = useState(false);
  const [pagoReservaId, setPagoReservaId] = useState<number>(0);
  const [pagoMonto, setPagoMonto] = useState<string>('25000');
  const [pagoMetodo, setPagoMetodo] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Tarjeta');
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [exitoPago, setExitoPago] = useState<string | null>(null);

  // 4. Comprobantes Form State
  const [mostrarFormComprobante, setMostrarFormComprobante] = useState(false);
  const [comprobantePagoId, setComprobantePagoId] = useState<number>(0);
  const [comprobanteNumero, setComprobanteNumero] = useState<string>('');
  const [comprobanteTipo, setComprobanteTipo] = useState<'Boleta' | 'Factura'>('Boleta');
  const [errorComprobante, setErrorComprobante] = useState<string | null>(null);
  const [exitoComprobante, setExitoComprobante] = useState<string | null>(null);

  // 5. Horarios Form State
  const [mostrarFormHorario, setMostrarFormHorario] = useState(false);
  const [horarioCanchaId, setHorarioCanchaId] = useState<number>(0);
  const [horarioDia, setHorarioDia] = useState<number>(1);
  const [horarioApertura, setHorarioApertura] = useState<string>('08:00');
  const [horarioCierre, setHorarioCierre] = useState<string>('22:00');
  const [errorHorario, setErrorHorario] = useState<string | null>(null);
  const [exitoHorario, setExitoHorario] = useState<string | null>(null);

  // 6. Mantenimientos Form State
  const [mostrarFormMantenimiento, setMostrarFormMantenimiento] = useState(false);
  const [mantenimientoCanchaId, setMantenimientoCanchaId] = useState<number>(0);
  const [mantenimientoTrabajadorId, setMantenimientoTrabajadorId] = useState<number>(0);
  const [mantenimientoDescripcion, setMantenimientoDescripcion] = useState<string>('');
  const [mantenimientoInicio, setMantenimientoInicio] = useState<string>('');
  const [mantenimientoFin, setMantenimientoFin] = useState<string>('');
  const [errorMantenimiento, setErrorMantenimiento] = useState<string | null>(null);
  const [exitoMantenimiento, setExitoMantenimiento] = useState<string | null>(null);

  // 7. Reseñas Form State
  const [mostrarFormResena, setMostrarFormResena] = useState(false);
  const [resenaReservaId, setResenaReservaId] = useState<number>(0);
  const [resenaCalificacion, setResenaCalificacion] = useState<number>(5);
  const [resenaComentario, setResenaComentario] = useState<string>('');
  const [errorResena, setErrorResena] = useState<string | null>(null);
  const [exitoResena, setExitoResena] = useState<string | null>(null);

  // 8. Notificaciones Form State
  const [mostrarFormNotificacion, setMostrarFormNotificacion] = useState(false);
  const [notificacionUsuarioId, setNotificacionUsuarioId] = useState<number>(0);
  const [notificacionMensaje, setNotificacionMensaje] = useState<string>('');
  const [errorNotificacion, setErrorNotificacion] = useState<string | null>(null);
  const [exitoNotificacion, setExitoNotificacion] = useState<string | null>(null);

  // 9. Trabajadores Form State
  const [mostrarFormTrabajador, setMostrarFormTrabajador] = useState(false);
  const [trabajadorUsuarioId, setTrabajadorUsuarioId] = useState<number>(0);
  const [trabajadorCargo, setTrabajadorCargo] = useState<string>('Encargado de Canchas');
  const [trabajadorTurno, setTrabajadorTurno] = useState<string>('Mañana');
  const [errorTrabajador, setErrorTrabajador] = useState<string | null>(null);
  const [exitoTrabajador, setExitoTrabajador] = useState<string | null>(null);

  // 10. Usuarios Form State
  const [mostrarFormUsuario, setMostrarFormUsuario] = useState(false);
  const [usuarioNombre, setUsuarioNombre] = useState<string>('');
  const [usuarioEmail, setUsuarioEmail] = useState<string>('');
  const [usuarioPassword, setUsuarioPassword] = useState<string>('');
  const [usuarioRol, setUsuarioRol] = useState<string>('Cliente');
  const [errorUsuario, setErrorUsuario] = useState<string | null>(null);
  const [exitoUsuario, setExitoUsuario] = useState<string | null>(null);

  // --- SUBMIT HANDLERS ---

  // 1. Sedes Submit
  const handleCrearSede = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSede(null);
    setExitoSede(null);

    if (!sedeNombre.trim() || !sedeDireccion.trim()) {
      setErrorSede('El nombre y la dirección son requeridos.');
      return;
    }

    try {
      await crearSedeMutation.mutateAsync({
        nombre: sedeNombre.trim(),
        direccion: sedeDireccion.trim(),
        telefono: sedeTelefono.trim() || undefined,
      });
      setExitoSede('¡Sede registrada exitosamente!');
      setSedeNombre('');
      setSedeDireccion('');
      setSedeTelefono('');
      setTimeout(() => {
        setMostrarFormSede(false);
        setExitoSede(null);
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorSede(errorObj?.message || 'Error al registrar la sede.');
    }
  };

  // 2. Reservas Submit
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

  // 3. Pagos Submit
  const handleCrearPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPago(null);
    setExitoPago(null);

    const reservaIdNum = Number(pagoReservaId) || reservasQuery.data?.[0]?.id;
    if (!reservaIdNum) {
      setErrorPago('Debes seleccionar una reserva válida.');
      return;
    }

    const montoNum = Number(pagoMonto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setErrorPago('El monto debe ser un número mayor a 0.');
      return;
    }

    try {
      await crearPagoMutation.mutateAsync({
        reservaId: reservaIdNum,
        monto: montoNum,
        metodoPago: pagoMetodo,
      });
      setExitoPago('¡Pago registrado exitosamente!');
      setTimeout(() => {
        setMostrarFormPago(false);
        setExitoPago(null);
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorPago(errorObj?.message || 'Error al registrar el pago.');
    }
  };

  // 4. Comprobantes Submit
  const handleCrearComprobante = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorComprobante(null);
    setExitoComprobante(null);

    const pagoIdNum = Number(comprobantePagoId) || pagosQuery.data?.[0]?.id;
    if (!pagoIdNum) {
      setErrorComprobante('Debes seleccionar un pago registrado.');
      return;
    }

    if (!comprobanteNumero.trim()) {
      setErrorComprobante('Ingresa el número de comprobante (ej. B001-0001).');
      return;
    }

    try {
      await crearComprobanteMutation.mutateAsync({
        pagoId: pagoIdNum,
        numeroComprobante: comprobanteNumero.trim(),
        tipo: comprobanteTipo,
      });
      setExitoComprobante('¡Comprobante electrónico emitido con éxito!');
      setComprobanteNumero('');
      setTimeout(() => {
        setMostrarFormComprobante(false);
        setExitoComprobante(null);
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorComprobante(errorObj?.message || 'Error al emitir el comprobante (recuerda que cada pago solo admite 1 comprobante).');
    }
  };

  // 5. Horarios Submit
  const handleCrearHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHorario(null);
    setExitoHorario(null);

    const canchaIdNum = Number(horarioCanchaId) || canchasQuery.data?.[0]?.id;
    if (!canchaIdNum) {
      setErrorHorario('Debes seleccionar una cancha.');
      return;
    }

    if (!horarioApertura || !horarioCierre) {
      setErrorHorario('Ingresa los horarios de apertura y cierre.');
      return;
    }
    if (horarioApertura >= horarioCierre) {
      setErrorHorario('La hora de apertura debe ser previa a la de cierre.');
      return;
    }

    try {
      await crearHorarioMutation.mutateAsync({
        canchaId: canchaIdNum,
        diaSemana: Number(horarioDia),
        horaApertura: horarioApertura,
        horaCierre: horarioCierre,
      });
      setExitoHorario('¡Horario de atención registrado con éxito!');
      setTimeout(() => {
        setMostrarFormHorario(false);
        setExitoHorario(null);
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorHorario(errorObj?.message || 'Error al registrar el horario.');
    }
  };

  // 6. Mantenimientos Submit
  const handleCrearMantenimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMantenimiento(null);
    setExitoMantenimiento(null);

    const canchaIdNum = Number(mantenimientoCanchaId) || canchasQuery.data?.[0]?.id;
    const trabajadorIdNum = Number(mantenimientoTrabajadorId) || trabajadoresQuery.data?.[0]?.id;

    if (!canchaIdNum) {
      setErrorMantenimiento('Selecciona una cancha.');
      return;
    }
    if (!trabajadorIdNum) {
      setErrorMantenimiento('Selecciona el trabajador técnico a cargo.');
      return;
    }
    if (!mantenimientoDescripcion.trim()) {
      setErrorMantenimiento('Ingresa el detalle o motivo del mantenimiento.');
      return;
    }
    if (!mantenimientoInicio) {
      setErrorMantenimiento('Ingresa la fecha de inicio del mantenimiento.');
      return;
    }

    try {
      await crearMantenimientoMutation.mutateAsync({
        canchaId: canchaIdNum,
        trabajadorId: trabajadorIdNum,
        descripcion: mantenimientoDescripcion.trim(),
        fechaInicio: new Date(mantenimientoInicio).toISOString(),
        fechaFin: mantenimientoFin ? new Date(mantenimientoFin).toISOString() : undefined,
      });
      setExitoMantenimiento('¡Bitácora de mantenimiento guardada exitosamente!');
      setMantenimientoDescripcion('');
      setMantenimientoInicio('');
      setMantenimientoFin('');
      setTimeout(() => {
        setMostrarFormMantenimiento(false);
        setExitoMantenimiento(null);
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorMantenimiento(errorObj?.message || 'Error al guardar el mantenimiento.');
    }
  };

  // 7. Reseñas Submit
  const handleCrearResena = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorResena(null);
    setExitoResena(null);

    const reservaIdNum = Number(resenaReservaId) || reservasQuery.data?.[0]?.id;
    if (!reservaIdNum) {
      setErrorResena('Selecciona una reserva para calificar.');
      return;
    }

    try {
      await crearResenaMutation.mutateAsync({
        reservaId: reservaIdNum,
        calificacion: Number(resenaCalificacion),
        comentario: resenaComentario.trim() || undefined,
      });
      setExitoResena('¡Gracias por tu reseña! Calificación registrada.');
      setResenaComentario('');
      setTimeout(() => {
        setMostrarFormResena(false);
        setExitoResena(null);
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorResena(errorObj?.message || 'Error al enviar la reseña (verifica que sea tu reserva y no tenga ya reseña previa).');
    }
  };

  // 8. Notificaciones Submit
  const handleCrearNotificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotificacion(null);
    setExitoNotificacion(null);

    const usuarioIdNum = Number(notificacionUsuarioId) || usuariosQuery.data?.[0]?.id;
    if (!usuarioIdNum) {
      setErrorNotificacion('Selecciona el usuario destinatario.');
      return;
    }
    if (!notificacionMensaje.trim()) {
      setErrorNotificacion('Escribe el mensaje de la notificación.');
      return;
    }

    try {
      await crearNotificacionMutation.mutateAsync({
        usuarioId: usuarioIdNum,
        mensaje: notificacionMensaje.trim(),
      });
      setExitoNotificacion('¡Notificación enviada al usuario con éxito!');
      setNotificacionMensaje('');
      setTimeout(() => {
        setMostrarFormNotificacion(false);
        setExitoNotificacion(null);
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorNotificacion(errorObj?.message || 'Error al enviar la notificación.');
    }
  };

  // 9. Trabajadores Submit
  const handleCrearTrabajador = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorTrabajador(null);
    setExitoTrabajador(null);

    const usuarioIdNum = Number(trabajadorUsuarioId) || usuariosQuery.data?.[0]?.id;
    if (!usuarioIdNum) {
      setErrorTrabajador('Selecciona el usuario para asignar rol operativo.');
      return;
    }
    if (!trabajadorCargo.trim() || !trabajadorTurno.trim()) {
      setErrorTrabajador('El cargo y el turno son campos requeridos.');
      return;
    }

    try {
      await crearTrabajadorMutation.mutateAsync({
        usuarioId: usuarioIdNum,
        cargo: trabajadorCargo.trim(),
        turno: trabajadorTurno.trim(),
      });
      setExitoTrabajador('¡Trabajador asignado y habilitado en el sistema!');
      setTimeout(() => {
        setMostrarFormTrabajador(false);
        setExitoTrabajador(null);
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorTrabajador(errorObj?.message || 'Error al crear trabajador (posiblemente el usuario ya está registrado como tal).');
    }
  };

  // 10. Usuarios Submit
  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorUsuario(null);
    setExitoUsuario(null);

    if (!usuarioNombre.trim() || !usuarioEmail.trim() || !usuarioPassword) {
      setErrorUsuario('Nombre, correo electrónico y contraseña son obligatorios.');
      return;
    }
    if (usuarioPassword.length < 8) {
      setErrorUsuario('La contraseña debe tener un mínimo de 8 caracteres.');
      return;
    }

    try {
      await crearUsuarioMutation.mutateAsync({
        nombre: usuarioNombre.trim(),
        email: usuarioEmail.trim(),
        password: usuarioPassword,
        rol: usuarioRol,
      });
      setExitoUsuario('¡Usuario creado con éxito en el sistema!');
      setUsuarioNombre('');
      setUsuarioEmail('');
      setUsuarioPassword('');
      setTimeout(() => {
        setMostrarFormUsuario(false);
        setExitoUsuario(null);
      }, 2000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorUsuario(errorObj?.message || 'Error al registrar usuario.');
    }
  };

  const diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="modulos-hub-page">
      <header className="page-header">
        <div>
          <nav aria-label="Ruta de navegación" className="breadcrumb">
            <Link to="/">Inicio</Link> / <span>Gestión Integral de Módulos</span>
          </nav>
          <h1>Panel de Control de Recursos y Operaciones</h1>
          <p className="text-muted">
            Consulta y registra información de todos los recursos del recinto deportivo (OWASP RBAC & BOLA).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(esAdmin || esTrabajador) && (
            <>
              <Link to="/canchas/nueva" className="btn btn-outline btn-sm">
                + Nueva Cancha
              </Link>
              <Link to="/tipos-cancha" className="btn btn-outline btn-sm">
                + Tipos de Cancha
              </Link>
            </>
          )}
          <Link to="/" className="btn btn-outline btn-sm">
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
              🔧 Mantenimiento ({mantenimientosQuery.data?.length ?? 0})
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
              <div>
                <h2>Sedes del Recinto Deportivo</h2>
                <span className="text-muted text-sm">Endpoints: GET & POST /api/v1/sedes</span>
              </div>
              {esAdmin && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setMostrarFormSede((prev) => !prev)}
                >
                  {mostrarFormSede ? 'Cerrar Formulario' : '+ Nueva Sede'}
                </button>
              )}
            </div>

            {/* Formulario Crear Sede (Admin) */}
            {mostrarFormSede && esAdmin && (
              <form
                onSubmit={handleCrearSede}
                className="form-card"
                style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)' }}>
                  Registrar Nueva Sede
                </h3>

                {errorSede && (
                  <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
                    {errorSede}
                  </div>
                )}
                {exitoSede && (
                  <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
                    {exitoSede}
                  </div>
                )}

                <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="sede-nombre">Nombre de la Sede *</label>
                    <input
                      id="sede-nombre"
                      type="text"
                      placeholder="Ej. Sede Cordillera"
                      value={sedeNombre}
                      onChange={(e) => setSedeNombre(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sede-direccion">Dirección *</label>
                    <input
                      id="sede-direccion"
                      type="text"
                      placeholder="Ej. Av. Marathon 5300, Macul"
                      value={sedeDireccion}
                      onChange={(e) => setSedeDireccion(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sede-telefono">Teléfono (Opcional)</label>
                    <input
                      id="sede-telefono"
                      type="tel"
                      placeholder="Ej. +56 9 8765 4321"
                      value={sedeTelefono}
                      onChange={(e) => setSedeTelefono(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setMostrarFormSede(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={crearSedeMutation.isPending}
                  >
                    {crearSedeMutation.isPending ? 'Guardando Sede...' : 'Guardar Sede'}
                  </button>
                </div>
              </form>
            )}

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

            {/* Formulario Crear Reserva */}
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
                          Cancha #{c.numero} ({c.tipoCanchaNombre} - {c.sedeNombre}) - ${c.precioPorHora.toLocaleString('es-CL')}/h
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
              <div>
                <h2>Registro de Pagos</h2>
                <span className="text-muted text-sm">Endpoints: GET & POST /api/v1/pagos (OWASP BOLA)</span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setMostrarFormPago((prev) => !prev)}
              >
                {mostrarFormPago ? 'Cerrar Formulario' : '+ Registrar Pago'}
              </button>
            </div>

            {/* Formulario Registrar Pago */}
            {mostrarFormPago && (
              <form
                onSubmit={handleCrearPago}
                className="form-card"
                style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)' }}>
                  Registrar Nuevo Pago de Reserva
                </h3>

                {errorPago && (
                  <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
                    {errorPago}
                  </div>
                )}
                {exitoPago && (
                  <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
                    {exitoPago}
                  </div>
                )}

                <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="pago-reserva">Asociar a Reserva *</label>
                    <select
                      id="pago-reserva"
                      value={pagoReservaId || (reservasQuery.data?.[0]?.id ?? 0)}
                      onChange={(e) => setPagoReservaId(Number(e.target.value))}
                    >
                      {reservasQuery.data?.map((r) => (
                        <option key={r.id} value={r.id}>
                          Reserva #{r.id} - Cancha {r.canchaNumero || r.canchaId} ({r.usuarioNombre || `Usuario ${r.usuarioId}`}) [{r.estado}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="pago-monto">Monto en CLP ($) *</label>
                    <input
                      id="pago-monto"
                      type="number"
                      min="1000"
                      step="500"
                      value={pagoMonto}
                      onChange={(e) => setPagoMonto(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pago-metodo">Método de Pago *</label>
                    <select
                      id="pago-metodo"
                      value={pagoMetodo}
                      onChange={(e) => setPagoMetodo(e.target.value as 'Efectivo' | 'Tarjeta' | 'Transferencia')}
                    >
                      <option value="Tarjeta">💳 Tarjeta (Débito / Crédito)</option>
                      <option value="Transferencia">🏦 Transferencia Bancaria</option>
                      <option value="Efectivo">💵 Efectivo</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setMostrarFormPago(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={crearPagoMutation.isPending}
                  >
                    {crearPagoMutation.isPending ? 'Procesando Pago...' : 'Registrar Pago'}
                  </button>
                </div>
              </form>
            )}

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
              <div>
                <h2>Comprobantes Electrónicos (Boletas / Facturas)</h2>
                <span className="text-muted text-sm">Endpoints: GET & POST /api/v1/comprobantes</span>
              </div>
              {(esAdmin || esTrabajador) && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setMostrarFormComprobante((prev) => !prev)}
                >
                  {mostrarFormComprobante ? 'Cerrar Formulario' : '+ Emitir Comprobante'}
                </button>
              )}
            </div>

            {/* Formulario Emitir Comprobante */}
            {mostrarFormComprobante && (esAdmin || esTrabajador) && (
              <form
                onSubmit={handleCrearComprobante}
                className="form-card"
                style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)' }}>
                  Emitir Comprobante Fiscal
                </h3>

                {errorComprobante && (
                  <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
                    {errorComprobante}
                  </div>
                )}
                {exitoComprobante && (
                  <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
                    {exitoComprobante}
                  </div>
                )}

                <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="comprobante-pago">Seleccionar Pago Pagado *</label>
                    <select
                      id="comprobante-pago"
                      value={comprobantePagoId || (pagosQuery.data?.[0]?.id ?? 0)}
                      onChange={(e) => setComprobantePagoId(Number(e.target.value))}
                    >
                      {pagosQuery.data?.map((p) => (
                        <option key={p.id} value={p.id}>
                          Pago #{p.id} - ${p.monto.toLocaleString('es-CL')} (Reserva #{p.reservaId} - {p.usuarioNombre || 'Cliente'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="comprobante-numero">Número de Folio / Comprobante *</label>
                    <input
                      id="comprobante-numero"
                      type="text"
                      placeholder="Ej. B001-00045 o F001-00012"
                      value={comprobanteNumero}
                      onChange={(e) => setComprobanteNumero(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="comprobante-tipo">Tipo Tributario *</label>
                    <select
                      id="comprobante-tipo"
                      value={comprobanteTipo}
                      onChange={(e) => setComprobanteTipo(e.target.value as 'Boleta' | 'Factura')}
                    >
                      <option value="Boleta">Boleta Electrónica</option>
                      <option value="Factura">Factura Electrónica</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setMostrarFormComprobante(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={crearComprobanteMutation.isPending}
                  >
                    {crearComprobanteMutation.isPending ? 'Emitiendo...' : 'Emitir Comprobante'}
                  </button>
                </div>
              </form>
            )}

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
              <div>
                <h2>Horarios de Funcionamiento</h2>
                <span className="text-muted text-sm">Endpoints: GET & POST /api/v1/horarios</span>
              </div>
              {(esAdmin || esTrabajador) && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setMostrarFormHorario((prev) => !prev)}
                >
                  {mostrarFormHorario ? 'Cerrar Formulario' : '+ Nuevo Horario'}
                </button>
              )}
            </div>

            {/* Formulario Crear Horario */}
            {mostrarFormHorario && (esAdmin || esTrabajador) && (
              <form
                onSubmit={handleCrearHorario}
                className="form-card"
                style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)' }}>
                  Definir Horario de Apertura y Cierre
                </h3>

                {errorHorario && (
                  <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
                    {errorHorario}
                  </div>
                )}
                {exitoHorario && (
                  <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
                    {exitoHorario}
                  </div>
                )}

                <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="horario-cancha">Cancha Destino *</label>
                    <select
                      id="horario-cancha"
                      value={horarioCanchaId || (canchasQuery.data?.[0]?.id ?? 0)}
                      onChange={(e) => setHorarioCanchaId(Number(e.target.value))}
                    >
                      {canchasQuery.data?.map((c) => (
                        <option key={c.id} value={c.id}>
                          Cancha #{c.numero} ({c.tipoCanchaNombre} - {c.sedeNombre})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="horario-dia">Día de la Semana *</label>
                    <select
                      id="horario-dia"
                      value={horarioDia}
                      onChange={(e) => setHorarioDia(Number(e.target.value))}
                    >
                      <option value={1}>Lunes</option>
                      <option value={2}>Martes</option>
                      <option value={3}>Miércoles</option>
                      <option value={4}>Jueves</option>
                      <option value={5}>Viernes</option>
                      <option value={6}>Sábado</option>
                      <option value={7}>Domingo</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="horario-apertura">Hora de Apertura *</label>
                    <input
                      id="horario-apertura"
                      type="time"
                      value={horarioApertura}
                      onChange={(e) => setHorarioApertura(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="horario-cierre">Hora de Cierre *</label>
                    <input
                      id="horario-cierre"
                      type="time"
                      value={horarioCierre}
                      onChange={(e) => setHorarioCierre(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setMostrarFormHorario(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={crearHorarioMutation.isPending}
                  >
                    {crearHorarioMutation.isPending ? 'Guardando...' : 'Guardar Horario'}
                  </button>
                </div>
              </form>
            )}

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
              <div>
                <h2>Bitácora de Mantenimientos</h2>
                <span className="text-muted text-sm">Endpoints: GET & POST /api/v1/mantenimientos</span>
              </div>
              {(esAdmin || esTrabajador) && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setMostrarFormMantenimiento((prev) => !prev)}
                >
                  {mostrarFormMantenimiento ? 'Cerrar Formulario' : '+ Registrar Mantenimiento'}
                </button>
              )}
            </div>

            {/* Formulario Registrar Mantenimiento */}
            {mostrarFormMantenimiento && (esAdmin || esTrabajador) && (
              <form
                onSubmit={handleCrearMantenimiento}
                className="form-card"
                style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)' }}>
                  Registrar Servicio Técnico o Mantenimiento
                </h3>

                {errorMantenimiento && (
                  <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
                    {errorMantenimiento}
                  </div>
                )}
                {exitoMantenimiento && (
                  <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
                    {exitoMantenimiento}
                  </div>
                )}

                <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="mant-cancha">Cancha Afectada *</label>
                    <select
                      id="mant-cancha"
                      value={mantenimientoCanchaId || (canchasQuery.data?.[0]?.id ?? 0)}
                      onChange={(e) => setMantenimientoCanchaId(Number(e.target.value))}
                    >
                      {canchasQuery.data?.map((c) => (
                        <option key={c.id} value={c.id}>
                          Cancha #{c.numero} ({c.tipoCanchaNombre} - {c.sedeNombre})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="mant-trabajador">Trabajador Técnico *</label>
                    <select
                      id="mant-trabajador"
                      value={mantenimientoTrabajadorId || (trabajadoresQuery.data?.[0]?.id ?? 0)}
                      onChange={(e) => setMantenimientoTrabajadorId(Number(e.target.value))}
                    >
                      {trabajadoresQuery.data?.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre} ({t.cargo} - {t.turno})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="mant-inicio">Fecha y Hora de Inicio *</label>
                    <input
                      id="mant-inicio"
                      type="datetime-local"
                      value={mantenimientoInicio}
                      onChange={(e) => setMantenimientoInicio(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mant-fin">Fecha de Fin Estimada (Opcional)</label>
                    <input
                      id="mant-fin"
                      type="datetime-local"
                      value={mantenimientoFin}
                      onChange={(e) => setMantenimientoFin(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="mant-desc">Descripción del Mantenimiento *</label>
                  <textarea
                    id="mant-desc"
                    rows={2}
                    placeholder="Detalla las tareas a realizar (ej. Reemplazo de césped sintético área penal, arreglo de focos LED...)"
                    value={mantenimientoDescripcion}
                    onChange={(e) => setMantenimientoDescripcion(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setMostrarFormMantenimiento(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={crearMantenimientoMutation.isPending}
                  >
                    {crearMantenimientoMutation.isPending ? 'Guardando...' : 'Registrar Mantenimiento'}
                  </button>
                </div>
              </form>
            )}

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
              <div>
                <h2>Reseñas y Calificaciones de Clientes</h2>
                <span className="text-muted text-sm">Endpoints: GET & POST /api/v1/resenas (OWASP BOLA)</span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setMostrarFormResena((prev) => !prev)}
              >
                {mostrarFormResena ? 'Cerrar Formulario' : '+ Nueva Reseña'}
              </button>
            </div>

            {/* Formulario Crear Reseña */}
            {mostrarFormResena && (
              <form
                onSubmit={handleCrearResena}
                className="form-card"
                style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)' }}>
                  Calificar tu Experiencia en Canchas
                </h3>

                {errorResena && (
                  <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
                    {errorResena}
                  </div>
                )}
                {exitoResena && (
                  <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
                    {exitoResena}
                  </div>
                )}

                <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="resena-reserva">Reserva a Calificar *</label>
                    <select
                      id="resena-reserva"
                      value={resenaReservaId || (reservasQuery.data?.[0]?.id ?? 0)}
                      onChange={(e) => setResenaReservaId(Number(e.target.value))}
                    >
                      {reservasQuery.data?.map((r) => (
                        <option key={r.id} value={r.id}>
                          Reserva #{r.id} - Cancha {r.canchaNumero || r.canchaId} ({new Date(r.fechaInicio).toLocaleDateString('es-CL')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="resena-calificacion">Puntuación (1 a 5 Estrellas) *</label>
                    <select
                      id="resena-calificacion"
                      value={resenaCalificacion}
                      onChange={(e) => setResenaCalificacion(Number(e.target.value))}
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Estrellas - Excelente)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Estrellas - Muy Buena)</option>
                      <option value={3}>⭐⭐⭐ (3 Estrellas - Buena)</option>
                      <option value={2}>⭐⭐ (2 Estrellas - Regular)</option>
                      <option value={1}>⭐ (1 Estrella - Insuficiente)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="resena-comentario">Comentario / Opinión (Opcional)</label>
                  <textarea
                    id="resena-comentario"
                    rows={2}
                    placeholder="Cuéntanos qué te pareció la cancha, iluminación, balones..."
                    value={resenaComentario}
                    onChange={(e) => setResenaComentario(e.target.value)}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setMostrarFormResena(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={crearResenaMutation.isPending}
                  >
                    {crearResenaMutation.isPending ? 'Publicando...' : 'Publicar Reseña'}
                  </button>
                </div>
              </form>
            )}

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
              <div>
                <h2>Centro de Notificaciones</h2>
                <span className="text-muted text-sm">Endpoints: GET & POST /api/v1/notificaciones</span>
              </div>
              {(esAdmin || esTrabajador) && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setMostrarFormNotificacion((prev) => !prev)}
                >
                  {mostrarFormNotificacion ? 'Cerrar Formulario' : '+ Enviar Notificación'}
                </button>
              )}
            </div>

            {/* Formulario Enviar Notificación */}
            {mostrarFormNotificacion && (esAdmin || esTrabajador) && (
              <form
                onSubmit={handleCrearNotificacion}
                className="form-card"
                style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)' }}>
                  Enviar Aviso o Alerta a un Usuario
                </h3>

                {errorNotificacion && (
                  <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
                    {errorNotificacion}
                  </div>
                )}
                {exitoNotificacion && (
                  <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
                    {exitoNotificacion}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="notif-usuario">Usuario Destinatario *</label>
                  <select
                    id="notif-usuario"
                    value={notificacionUsuarioId || (usuariosQuery.data?.[0]?.id ?? 0)}
                    onChange={(e) => setNotificacionUsuarioId(Number(e.target.value))}
                  >
                    {usuariosQuery.data?.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} ({u.email}) [{u.rol}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="notif-mensaje">Mensaje de Notificación *</label>
                  <textarea
                    id="notif-mensaje"
                    rows={2}
                    placeholder="Ej. Tu reserva para mañana a las 18:00 ha sido confirmada en Cancha 2."
                    value={notificacionMensaje}
                    onChange={(e) => setNotificacionMensaje(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setMostrarFormNotificacion(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={crearNotificacionMutation.isPending}
                  >
                    {crearNotificacionMutation.isPending ? 'Enviando...' : 'Enviar Notificación'}
                  </button>
                </div>
              </form>
            )}

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
              <div>
                <h2>Equipo de Trabajadores</h2>
                <span className="text-muted text-sm">Endpoints: GET & POST /api/v1/trabajadores (Admin)</span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setMostrarFormTrabajador((prev) => !prev)}
              >
                {mostrarFormTrabajador ? 'Cerrar Formulario' : '+ Asignar Trabajador'}
              </button>
            </div>

            {/* Formulario Asignar Trabajador */}
            {mostrarFormTrabajador && (
              <form
                onSubmit={handleCrearTrabajador}
                className="form-card"
                style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)' }}>
                  Asignar Rol de Trabajador a un Usuario
                </h3>

                {errorTrabajador && (
                  <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
                    {errorTrabajador}
                  </div>
                )}
                {exitoTrabajador && (
                  <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
                    {exitoTrabajador}
                  </div>
                )}

                <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="trab-usuario">Usuario a Promover *</label>
                    <select
                      id="trab-usuario"
                      value={trabajadorUsuarioId || (usuariosQuery.data?.[0]?.id ?? 0)}
                      onChange={(e) => setTrabajadorUsuarioId(Number(e.target.value))}
                    >
                      {usuariosQuery.data?.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nombre} ({u.email}) [{u.rol}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="trab-cargo">Cargo o Responsabilidad *</label>
                    <input
                      id="trab-cargo"
                      type="text"
                      placeholder="Ej. Técnico de Mantenimiento, Supervisor"
                      value={trabajadorCargo}
                      onChange={(e) => setTrabajadorCargo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="trab-turno">Turno Asignado *</label>
                    <select
                      id="trab-turno"
                      value={trabajadorTurno}
                      onChange={(e) => setTrabajadorTurno(e.target.value)}
                    >
                      <option value="Mañana">Mañana (08:00 - 16:00)</option>
                      <option value="Tarde">Tarde (16:00 - 00:00)</option>
                      <option value="Noche">Noche (00:00 - 08:00)</option>
                      <option value="Rotativo">Turno Rotativo</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setMostrarFormTrabajador(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={crearTrabajadorMutation.isPending}
                  >
                    {crearTrabajadorMutation.isPending ? 'Guardando...' : 'Asignar Trabajador'}
                  </button>
                </div>
              </form>
            )}

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
              <div>
                <h2>Usuarios Registrados en el Sistema</h2>
                <span className="text-muted text-sm">Endpoints: GET & POST /api/v1/usuarios (Admin)</span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setMostrarFormUsuario((prev) => !prev)}
              >
                {mostrarFormUsuario ? 'Cerrar Formulario' : '+ Nuevo Usuario'}
              </button>
            </div>

            {/* Formulario Crear Usuario */}
            {mostrarFormUsuario && (
              <form
                onSubmit={handleCrearUsuario}
                className="form-card"
                style={{ marginBottom: '1.5rem', maxWidth: '100%' }}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)' }}>
                  Registrar Nuevo Usuario del Sistema
                </h3>

                {errorUsuario && (
                  <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>
                    {errorUsuario}
                  </div>
                )}
                {exitoUsuario && (
                  <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
                    {exitoUsuario}
                  </div>
                )}

                <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="usr-nombre">Nombre Completo *</label>
                    <input
                      id="usr-nombre"
                      type="text"
                      placeholder="Ej. Juan Pérez González"
                      value={usuarioNombre}
                      onChange={(e) => setUsuarioNombre(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="usr-email">Correo Electrónico *</label>
                    <input
                      id="usr-email"
                      type="email"
                      placeholder="usuario@ejemplo.cl"
                      value={usuarioEmail}
                      onChange={(e) => setUsuarioEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="usr-password">Contraseña (Mínimo 8 car.) *</label>
                    <input
                      id="usr-password"
                      type="password"
                      placeholder="••••••••"
                      value={usuarioPassword}
                      onChange={(e) => setUsuarioPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="usr-rol">Rol en el Sistema *</label>
                    <select
                      id="usr-rol"
                      value={usuarioRol}
                      onChange={(e) => setUsuarioRol(e.target.value)}
                    >
                      <option value="Cliente">Cliente</option>
                      <option value="Trabajador">Trabajador</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setMostrarFormUsuario(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={crearUsuarioMutation.isPending}
                  >
                    {crearUsuarioMutation.isPending ? 'Guardando...' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            )}

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
