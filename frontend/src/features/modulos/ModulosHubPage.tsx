import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { usePaginacion } from '../../hooks/usePaginacion';
import { PaginacionControls } from '../../components/PaginacionControls';
import { useCanchas, useCrearCancha, useEliminarCancha } from '../canchas/useCanchasQuery';
import { useTiposCancha, useCrearTipoCancha, useEliminarTipoCancha } from '../tipos-cancha/useTiposCanchaQuery';
import {
  useSedesList,
  useCrearSede,
  useEliminarSede,
  useReservasList,
  useCrearReserva,
  useEliminarReserva,
  usePagosList,
  useCrearPago,
  useEliminarPago,
  useComprobantesList,
  useCrearComprobante,
  useEliminarComprobante,
  useMantenimientosList,
  useCrearMantenimiento,
  useEliminarMantenimiento,
  useResenasList,
  useCrearResena,
  useEliminarResena,
  useNotificacionesList,
  useCrearNotificacion,
  useEliminarNotificacion,
  useTrabajadoresList,
  useCrearTrabajador,
  useEliminarTrabajador,
  useUsuariosList,
  useCrearUsuario,
  useEliminarUsuario,
  useHorariosList,
  useCrearHorario,
  useEliminarHorario,
} from './useModulosQuery';

export type ModuloTab =
  | 'canchas'
  | 'tipos'
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

type CategoriaModulo = 'todos' | 'instalaciones' | 'operaciones' | 'servicios' | 'administracion';

interface ModuloConfig {
  id: ModuloTab;
  nombre: string;
  icono: string;
  categoria: 'instalaciones' | 'operaciones' | 'servicios' | 'administracion';
  descripcion: string;
  adminOnly?: boolean;
}

const MODULOS_CONFIG: ModuloConfig[] = [
  // 1. Instalaciones
  { id: 'canchas', nombre: 'Canchas Deportivas', icono: '⚽', categoria: 'instalaciones', descripcion: 'Gestión y estado operativo de canchas' },
  { id: 'tipos', nombre: 'Tipos de Cancha', icono: '🏷️', categoria: 'instalaciones', descripcion: 'Disciplinas deportivas y tarifas horarias' },
  { id: 'sedes', nombre: 'Sedes del Complejo', icono: '🏢', categoria: 'instalaciones', descripcion: 'Recintos, direcciones y teléfonos' },
  { id: 'horarios', nombre: 'Horarios de Atención', icono: '⏰', categoria: 'instalaciones', descripcion: 'Apertura y cierre por día de la semana' },

  // 2. Operaciones
  { id: 'reservas', nombre: 'Reservas de Canchas', icono: '📅', categoria: 'operaciones', descripcion: 'Agendamiento y disponibilidad de turnos' },
  { id: 'pagos', nombre: 'Pagos y Transacciones', icono: '💳', categoria: 'operaciones', descripcion: 'Registro de cobros y métodos de pago' },
  { id: 'comprobantes', nombre: 'Comprobantes Fiscales', icono: '📄', categoria: 'operaciones', descripcion: 'Emisión de boletas y facturas oficiales' },

  // 3. Servicios
  { id: 'mantenimientos', nombre: 'Mantenimientos', icono: '🔧', categoria: 'servicios', descripcion: 'Bitácora técnica y reparaciones en canchas' },
  { id: 'resenas', nombre: 'Reseñas de Clientes', icono: '⭐', categoria: 'servicios', descripcion: 'Calificaciones con estrellas y comentarios' },
  { id: 'notificaciones', nombre: 'Notificaciones', icono: '🔔', categoria: 'servicios', descripcion: 'Avisos y mensajes a usuarios del recinto' },

  // 4. Administración
  { id: 'trabajadores', nombre: 'Personal Operativo', icono: '👷', categoria: 'administracion', descripcion: 'Trabajadores, cargos y turnos laborales', adminOnly: true },
  { id: 'usuarios', nombre: 'Usuarios del Sistema', icono: '👥', categoria: 'administracion', descripcion: 'Cuentas registradas y roles de acceso', adminOnly: true },
];

const diasSemana: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

export const ModulosHubPage: React.FC = () => {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'Administrador';
  const esTrabajador = usuario?.rol === 'Trabajador';
  const puedeGestionar = esAdmin || esTrabajador;

  // Sincronización reactiva directa con query string URL (?tab=...)
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as ModuloTab | null;
  const tabActiva: ModuloTab = tabParam && MODULOS_CONFIG.some((m) => m.id === tabParam) ? tabParam : 'canchas';

  const cambiarTab = (tab: ModuloTab) => {
    setSearchParams({ tab });
  };

  // Estados de filtrado del Hub
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaModulo>('todos');
  const [busquedaModulo, setBusquedaModulo] = useState<string>('');

  // Cambiar categoría y sincronizar automáticamente la pestaña activa si no corresponde
  const handleSeleccionarCategoria = (cat: CategoriaModulo) => {
    setCategoriaSeleccionada(cat);
    if (cat !== 'todos') {
      const modulosDeCategoria = MODULOS_CONFIG.filter((m) => m.categoria === cat && (!m.adminOnly || esAdmin));
      const moduloActualEnCategoria = modulosDeCategoria.some((m) => m.id === tabActiva);
      if (!moduloActualEnCategoria && modulosDeCategoria.length > 0) {
        cambiarTab(modulosDeCategoria[0].id);
      }
    }
  };

  // Filtros internos de Canchas
  const [canchasBusqueda, setCanchasBusqueda] = useState<string>('');
  const [canchasFiltroSede, setCanchasFiltroSede] = useState<string>('');
  const [canchasFiltroTipo, setCanchasFiltroTipo] = useState<string>('');
  const [canchasFiltroEstado, setCanchasFiltroEstado] = useState<string>('');

  // Queries de datos
  const canchasQuery = useCanchas();
  const tiposQuery = useTiposCancha();
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

  // Mutations de Creación
  const crearCanchaMutation = useCrearCancha();
  const eliminarCanchaMutation = useEliminarCancha();
  const crearTipoMutation = useCrearTipoCancha();
  const eliminarTipoMutation = useEliminarTipoCancha();
  const crearSedeMutation = useCrearSede();
  const eliminarSedeMutation = useEliminarSede();
  const crearReservaMutation = useCrearReserva();
  const eliminarReservaMutation = useEliminarReserva();
  const crearPagoMutation = useCrearPago();
  const eliminarPagoMutation = useEliminarPago();
  const crearComprobanteMutation = useCrearComprobante();
  const eliminarComprobanteMutation = useEliminarComprobante();
  const crearHorarioMutation = useCrearHorario();
  const eliminarHorarioMutation = useEliminarHorario();
  const crearMantenimientoMutation = useCrearMantenimiento();
  const eliminarMantenimientoMutation = useEliminarMantenimiento();
  const crearResenaMutation = useCrearResena();
  const eliminarResenaMutation = useEliminarResena();
  const crearNotificacionMutation = useCrearNotificacion();
  const eliminarNotificacionMutation = useEliminarNotificacion();
  const crearTrabajadorMutation = useCrearTrabajador();
  const eliminarTrabajadorMutation = useEliminarTrabajador();
  const crearUsuarioMutation = useCrearUsuario();
  const eliminarUsuarioMutation = useEliminarUsuario();

  // 1. Canchas Form State
  const [canchaNumero, setCanchaNumero] = useState<string>('');
  const [canchaSedeId, setCanchaSedeId] = useState<number>(0);
  const [canchaTipoId, setCanchaTipoId] = useState<number>(0);
  const [canchaEstado, setCanchaEstado] = useState<'Disponible' | 'Mantenimiento' | 'Fuera de servicio'>('Disponible');
  const [errorCancha, setErrorCancha] = useState<string | null>(null);
  const [exitoCancha, setExitoCancha] = useState<string | null>(null);

  // 2. Tipos Form State
  const [tipoNombre, setTipoNombre] = useState<string>('');
  const [tipoPrecio, setTipoPrecio] = useState<string>('20000');
  const [tipoDescripcion, setTipoDescripcion] = useState<string>('');
  const [errorTipo, setErrorTipo] = useState<string | null>(null);
  const [exitoTipo, setExitoTipo] = useState<string | null>(null);

  // 3. Sedes Form State
  const [sedeNombre, setSedeNombre] = useState('');
  const [sedeDireccion, setSedeDireccion] = useState('');
  const [sedeTelefono, setSedeTelefono] = useState('');
  const [errorSede, setErrorSede] = useState<string | null>(null);
  const [exitoSede, setExitoSede] = useState<string | null>(null);

  // 4. Reservas Form State
  const [reservaCanchaId, setReservaCanchaId] = useState<number>(0);
  const [reservaInicio, setReservaInicio] = useState<string>('');
  const [reservaFin, setReservaFin] = useState<string>('');
  const [errorReserva, setErrorReserva] = useState<string | null>(null);
  const [exitoReserva, setExitoReserva] = useState<string | null>(null);

  // 5. Pagos Form State
  const [pagoReservaId, setPagoReservaId] = useState<number>(0);
  const [pagoMonto, setPagoMonto] = useState<string>('25000');
  const [pagoMetodo, setPagoMetodo] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Tarjeta');
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [exitoPago, setExitoPago] = useState<string | null>(null);

  // 6. Comprobantes Form State
  const [comprobantePagoId, setComprobantePagoId] = useState<number>(0);
  const [comprobanteNumero, setComprobanteNumero] = useState<string>('');
  const [comprobanteTipo, setComprobanteTipo] = useState<'Boleta' | 'Factura'>('Boleta');
  const [errorComprobante, setErrorComprobante] = useState<string | null>(null);
  const [exitoComprobante, setExitoComprobante] = useState<string | null>(null);

  // 7. Horarios Form State
  const [horarioCanchaId, setHorarioCanchaId] = useState<number>(0);
  const [horarioDia, setHorarioDia] = useState<number>(1);
  const [horarioApertura, setHorarioApertura] = useState<string>('08:00');
  const [horarioCierre, setHorarioCierre] = useState<string>('22:00');
  const [errorHorario, setErrorHorario] = useState<string | null>(null);
  const [exitoHorario, setExitoHorario] = useState<string | null>(null);

  // 8. Mantenimientos Form State
  const [mantenimientoCanchaId, setMantenimientoCanchaId] = useState<number>(0);
  const [mantenimientoTrabajadorId, setMantenimientoTrabajadorId] = useState<number>(0);
  const [mantenimientoDescripcion, setMantenimientoDescripcion] = useState<string>('');
  const [mantenimientoInicio, setMantenimientoInicio] = useState<string>('');
  const [mantenimientoFin, setMantenimientoFin] = useState<string>('');
  const [errorMantenimiento, setErrorMantenimiento] = useState<string | null>(null);
  const [exitoMantenimiento, setExitoMantenimiento] = useState<string | null>(null);

  // 9. Reseñas Form State
  const [resenaReservaId, setResenaReservaId] = useState<number>(0);
  const [resenaCalificacion, setResenaCalificacion] = useState<number>(5);
  const [resenaComentario, setResenaComentario] = useState<string>('');
  const [errorResena, setErrorResena] = useState<string | null>(null);
  const [exitoResena, setExitoResena] = useState<string | null>(null);

  // 10. Notificaciones Form State
  const [notificacionUsuarioId, setNotificacionUsuarioId] = useState<number>(0);
  const [notificacionMensaje, setNotificacionMensaje] = useState<string>('');
  const [errorNotificacion, setErrorNotificacion] = useState<string | null>(null);
  const [exitoNotificacion, setExitoNotificacion] = useState<string | null>(null);

  // 11. Trabajadores Form State
  const [trabajadorUsuarioId, setTrabajadorUsuarioId] = useState<number>(0);
  const [trabajadorCargo, setTrabajadorCargo] = useState<string>('Encargado de Canchas');
  const [trabajadorTurno, setTrabajadorTurno] = useState<string>('Mañana');
  const [errorTrabajador, setErrorTrabajador] = useState<string | null>(null);
  const [exitoTrabajador, setExitoTrabajador] = useState<string | null>(null);

  // 12. Usuarios Form State
  const [usuarioNombre, setUsuarioNombre] = useState<string>('');
  const [usuarioEmail, setUsuarioEmail] = useState<string>('');
  const [usuarioPassword, setUsuarioPassword] = useState<string>('');
  const [usuarioRol, setUsuarioRol] = useState<string>('Cliente');
  const [errorUsuario, setErrorUsuario] = useState<string | null>(null);
  const [exitoUsuario, setExitoUsuario] = useState<string | null>(null);

  // Mapeo de conteos para cada módulo
  const countsMap: Record<ModuloTab, number> = {
    canchas: canchasQuery.data?.length ?? 0,
    tipos: tiposQuery.data?.length ?? 0,
    sedes: sedesQuery.data?.length ?? 0,
    reservas: reservasQuery.data?.length ?? 0,
    pagos: pagosQuery.data?.length ?? 0,
    comprobantes: comprobantesQuery.data?.length ?? 0,
    horarios: horariosQuery.data?.length ?? 0,
    mantenimientos: mantenimientosQuery.data?.length ?? 0,
    resenas: resenasQuery.data?.length ?? 0,
    notificaciones: notificacionesQuery.data?.length ?? 0,
    trabajadores: trabajadoresQuery.data?.length ?? 0,
    usuarios: usuariosQuery.data?.length ?? 0,
  };

  // Filtrado de módulos en la barra lateral
  const modulosFiltrados = useMemo(() => {
    return MODULOS_CONFIG.filter((m) => {
      if (m.adminOnly && !esAdmin) return false;
      if (categoriaSeleccionada !== 'todos' && m.categoria !== categoriaSeleccionada) return false;
      if (busquedaModulo.trim()) {
        const query = busquedaModulo.toLowerCase().trim();
        return (
          m.nombre.toLowerCase().includes(query) ||
          m.descripcion.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [esAdmin, categoriaSeleccionada, busquedaModulo]);

  // Filtrado de la lista de Canchas
  const canchasFiltradas = useMemo(() => {
    const lista = canchasQuery.data ?? [];
    return lista.filter((c) => {
      if (canchasFiltroSede && c.sedeId.toString() !== canchasFiltroSede) return false;
      if (canchasFiltroTipo && c.tipoCanchaId.toString() !== canchasFiltroTipo) return false;
      if (canchasFiltroEstado && c.estado !== canchasFiltroEstado) return false;
      if (canchasBusqueda.trim()) {
        const query = canchasBusqueda.toLowerCase().trim();
        return (
          c.id.toString() === query ||
          c.numero.toString().includes(query) ||
          c.sedeNombre.toLowerCase().includes(query) ||
          c.tipoCanchaNombre.toLowerCase().includes(query) ||
          c.estado.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [canchasQuery.data, canchasBusqueda, canchasFiltroSede, canchasFiltroTipo, canchasFiltroEstado]);

  // ─── Paginación por módulo (10 ítems por defecto) ─────────────────────────
  const pagCanchas       = usePaginacion(canchasFiltradas, 10);
  const pagTipos         = usePaginacion(tiposQuery.data ?? [], 10);
  const pagSedes         = usePaginacion(sedesQuery.data ?? [], 10);
  const pagReservas      = usePaginacion(reservasQuery.data ?? [], 10);
  const pagPagos         = usePaginacion(pagosQuery.data ?? [], 10);
  const pagComprobantes  = usePaginacion(comprobantesQuery.data ?? [], 10);
  const pagHorarios      = usePaginacion(horariosQuery.data ?? [], 10);
  const pagMantenimientos = usePaginacion(mantenimientosQuery.data ?? [], 10);
  const pagResenas       = usePaginacion(resenasQuery.data ?? [], 10);
  const pagNotificaciones = usePaginacion(notificacionesQuery.data ?? [], 10);
  const pagTrabajadores  = usePaginacion(trabajadoresQuery.data ?? [], 10);
  const pagUsuarios      = usePaginacion(usuariosQuery.data ?? [], 10);
  // ──────────────────────────────────────────────────────────────────────────

  // Manejadores de creación (POST)
  const handleCrearCancha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCancha(null);
    setExitoCancha(null);
    const num = Number(canchaNumero);
    const sede = Number(canchaSedeId) || sedesQuery.data?.[0]?.id;
    const tipo = Number(canchaTipoId) || tiposQuery.data?.[0]?.id;
    if (!num || num <= 0) {
      setErrorCancha('Ingresa un número de cancha válido.');
      return;
    }
    if (!sede || !tipo) {
      setErrorCancha('Debes seleccionar una sede y un tipo de cancha.');
      return;
    }
    try {
      await crearCanchaMutation.mutateAsync({
        numero: num,
        sedeId: sede,
        tipoCanchaId: tipo,
        estado: canchaEstado,
      });
      setExitoCancha('¡Cancha deportiva registrada exitosamente!');
      setCanchaNumero('');
      setTimeout(() => setExitoCancha(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorCancha(errorObj?.message || 'Error al crear la cancha.');
    }
  };

  const handleEliminarCancha = async (id: number, numero: number) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la Cancha N° ${numero}?`)) {
      try {
        await eliminarCanchaMutation.mutateAsync(id);
      } catch {
        alert('Error al intentar eliminar la cancha. Verifica tus permisos.');
      }
    }
  };

  const handleCrearTipo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorTipo(null);
    setExitoTipo(null);
    const precio = Number(tipoPrecio);
    if (!tipoNombre.trim()) {
      setErrorTipo('El nombre de la disciplina o tipo es obligatorio.');
      return;
    }
    if (isNaN(precio) || precio <= 0) {
      setErrorTipo('El precio por hora debe ser mayor a 0.');
      return;
    }
    try {
      await crearTipoMutation.mutateAsync({
        nombre: tipoNombre.trim(),
        descripcion: tipoDescripcion.trim() || undefined,
        precioPorHora: precio,
      });
      setExitoTipo('¡Tipo de cancha creado exitosamente!');
      setTipoNombre('');
      setTipoDescripcion('');
      setTimeout(() => setExitoTipo(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorTipo(errorObj?.message || 'Error al guardar el tipo de cancha.');
    }
  };

  const handleEliminarTipo = async (id: number, nombre: string) => {
    if (window.confirm(`¿Eliminar el tipo de cancha "${nombre}"?`)) {
      try {
        await eliminarTipoMutation.mutateAsync(id);
      } catch {
        alert('Error al eliminar tipo de cancha. Puede tener canchas asociadas.');
      }
    }
  };

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
      setTimeout(() => setExitoSede(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorSede(errorObj?.message || 'Error al crear la sede.');
    }
  };

  const handleEliminarSede = async (id: number, nombre: string) => {
    if (window.confirm(`¿Eliminar la sede "${nombre}"?`)) {
      try {
        await eliminarSedeMutation.mutateAsync(id);
      } catch {
        alert('Error al eliminar sede. Puede tener canchas asociadas.');
      }
    }
  };

  const handleCrearReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorReserva(null);
    setExitoReserva(null);
    const cancha = reservaCanchaId || canchasQuery.data?.[0]?.id;
    if (!cancha) {
      setErrorReserva('Selecciona una cancha para reservar.');
      return;
    }
    if (!reservaInicio || !reservaFin) {
      setErrorReserva('Las fechas de inicio y fin son obligatorias.');
      return;
    }
    try {
      await crearReservaMutation.mutateAsync({
        canchaId: cancha,
        fechaInicio: new Date(reservaInicio).toISOString(),
        fechaFin: new Date(reservaFin).toISOString(),
      });
      setExitoReserva('¡Reserva creada con éxito!');
      setReservaInicio('');
      setReservaFin('');
      setTimeout(() => setExitoReserva(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorReserva(errorObj?.message || 'Error al procesar la reserva. Verifica el horario.');
    }
  };

  const handleEliminarReserva = async (id: number) => {
    if (window.confirm(`¿Estás seguro de cancelar/eliminar la Reserva #${id}?`)) {
      try {
        await eliminarReservaMutation.mutateAsync(id);
      } catch {
        alert('Error al eliminar la reserva.');
      }
    }
  };

  const handleCrearPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPago(null);
    setExitoPago(null);
    const resId = pagoReservaId || reservasQuery.data?.[0]?.id;
    const monto = Number(pagoMonto);
    if (!resId) {
      setErrorPago('Debes seleccionar una reserva válida.');
      return;
    }
    if (isNaN(monto) || monto <= 0) {
      setErrorPago('El monto debe ser superior a 0.');
      return;
    }
    try {
      await crearPagoMutation.mutateAsync({
        reservaId: resId,
        monto,
        metodoPago: pagoMetodo,
      });
      setExitoPago('¡Pago registrado correctamente!');
      setTimeout(() => setExitoPago(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorPago(errorObj?.message || 'Error al registrar el pago.');
    }
  };

  const handleEliminarPago = async (id: number) => {
    if (window.confirm(`¿Eliminar el registro de Pago #${id}?`)) {
      try {
        await eliminarPagoMutation.mutateAsync(id);
      } catch {
        alert('Error al eliminar el pago.');
      }
    }
  };

  const handleCrearComprobante = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorComprobante(null);
    setExitoComprobante(null);
    const pagoId = comprobantePagoId || pagosQuery.data?.[0]?.id;
    if (!pagoId) {
      setErrorComprobante('Debes asociar el comprobante a un pago existente.');
      return;
    }
    if (!comprobanteNumero.trim()) {
      setErrorComprobante('El número de comprobante es requerido.');
      return;
    }
    try {
      await crearComprobanteMutation.mutateAsync({
        pagoId,
        numeroComprobante: comprobanteNumero.trim(),
        tipo: comprobanteTipo,
      });
      setExitoComprobante('¡Comprobante emitido con éxito!');
      setComprobanteNumero('');
      setTimeout(() => setExitoComprobante(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorComprobante(errorObj?.message || 'Error al emitir el comprobante.');
    }
  };

  const handleEliminarComprobante = async (id: number) => {
    if (window.confirm(`¿Eliminar el Comprobante #${id}?`)) {
      try {
        await eliminarComprobanteMutation.mutateAsync(id);
      } catch {
        alert('Error al eliminar el comprobante.');
      }
    }
  };

  const handleCrearHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHorario(null);
    setExitoHorario(null);
    const cancha = horarioCanchaId || canchasQuery.data?.[0]?.id;
    if (!cancha) {
      setErrorHorario('Debes seleccionar una cancha.');
      return;
    }
    try {
      await crearHorarioMutation.mutateAsync({
        canchaId: cancha,
        diaSemana: Number(horarioDia),
        horaApertura: horarioApertura,
        horaCierre: horarioCierre,
      });
      setExitoHorario('¡Horario asignado exitosamente!');
      setTimeout(() => setExitoHorario(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorHorario(errorObj?.message || 'Error al guardar el horario.');
    }
  };

  const handleEliminarHorario = async (id: number) => {
    if (window.confirm(`¿Eliminar el Horario #${id}?`)) {
      try {
        await eliminarHorarioMutation.mutateAsync(id);
      } catch {
        alert('Error al eliminar horario.');
      }
    }
  };

  const handleCrearMantenimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMantenimiento(null);
    setExitoMantenimiento(null);
    const cancha = mantenimientoCanchaId || canchasQuery.data?.[0]?.id;
    const trabajador = mantenimientoTrabajadorId || trabajadoresQuery.data?.[0]?.id;
    if (!cancha || !trabajador) {
      setErrorMantenimiento('Cancha y Trabajador asignado son obligatorios.');
      return;
    }
    if (!mantenimientoDescripcion.trim() || !mantenimientoInicio) {
      setErrorMantenimiento('Descripción y Fecha de Inicio son obligatorios.');
      return;
    }
    try {
      await crearMantenimientoMutation.mutateAsync({
        canchaId: cancha,
        trabajadorId: trabajador,
        descripcion: mantenimientoDescripcion.trim(),
        fechaInicio: new Date(mantenimientoInicio).toISOString(),
        fechaFin: mantenimientoFin ? new Date(mantenimientoFin).toISOString() : undefined,
      });
      setExitoMantenimiento('¡Orden de mantenimiento creada con éxito!');
      setMantenimientoDescripcion('');
      setTimeout(() => setExitoMantenimiento(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorMantenimiento(errorObj?.message || 'Error al guardar el mantenimiento.');
    }
  };

  const handleEliminarMantenimiento = async (id: number) => {
    if (window.confirm(`¿Eliminar la orden de Mantenimiento #${id}?`)) {
      try {
        await eliminarMantenimientoMutation.mutateAsync(id);
      } catch {
        alert('Error al eliminar el mantenimiento.');
      }
    }
  };

  const handleCrearResena = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorResena(null);
    setExitoResena(null);
    const resId = resenaReservaId || reservasQuery.data?.[0]?.id;
    if (!resId) {
      setErrorResena('Debes seleccionar una reserva completada.');
      return;
    }
    try {
      await crearResenaMutation.mutateAsync({
        reservaId: resId,
        calificacion: Number(resenaCalificacion),
        comentario: resenaComentario.trim() || undefined,
      });
      setExitoResena('¡Muchas gracias por calificar nuestro servicio!');
      setResenaComentario('');
      setTimeout(() => setExitoResena(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorResena(errorObj?.message || 'Error al publicar la reseña.');
    }
  };

  const handleEliminarResena = async (id: number) => {
    if (window.confirm(`¿Eliminar la Reseña #${id}?`)) {
      try {
        await eliminarResenaMutation.mutateAsync(id);
      } catch {
        alert('Error al eliminar la reseña.');
      }
    }
  };

  const handleCrearNotificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotificacion(null);
    setExitoNotificacion(null);
    const uId = notificacionUsuarioId || usuariosQuery.data?.[0]?.id;
    if (!uId) {
      setErrorNotificacion('Selecciona un usuario destinatario.');
      return;
    }
    if (!notificacionMensaje.trim()) {
      setErrorNotificacion('El mensaje no puede estar vacío.');
      return;
    }
    try {
      await crearNotificacionMutation.mutateAsync({
        usuarioId: uId,
        mensaje: notificacionMensaje.trim(),
      });
      setExitoNotificacion('¡Notificación enviada!');
      setNotificacionMensaje('');
      setTimeout(() => setExitoNotificacion(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorNotificacion(errorObj?.message || 'Error al enviar la notificación.');
    }
  };

  const handleEliminarNotificacion = async (id: number) => {
    if (window.confirm(`¿Eliminar la Notificación #${id}?`)) {
      try {
        await eliminarNotificacionMutation.mutateAsync(id);
      } catch {
        alert('Error al eliminar la notificación.');
      }
    }
  };

  const handleCrearTrabajador = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorTrabajador(null);
    setExitoTrabajador(null);
    const uId = trabajadorUsuarioId || usuariosQuery.data?.[0]?.id;
    if (!uId) {
      setErrorTrabajador('Selecciona un usuario para asignar el cargo.');
      return;
    }
    if (!trabajadorCargo.trim()) {
      setErrorTrabajador('El cargo es requerido.');
      return;
    }
    try {
      await crearTrabajadorMutation.mutateAsync({
        usuarioId: uId,
        cargo: trabajadorCargo.trim(),
        turno: trabajadorTurno,
      });
      setExitoTrabajador('¡Trabajador asignado exitosamente!');
      setTimeout(() => setExitoTrabajador(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorTrabajador(errorObj?.message || 'Error al asignar trabajador.');
    }
  };

  const handleEliminarTrabajador = async (id: number, nombre?: string) => {
    if (window.confirm(`¿Remover a ${nombre || 'este trabajador'} del personal operativo?`)) {
      try {
        await eliminarTrabajadorMutation.mutateAsync(id);
      } catch {
        alert('Error al remover trabajador.');
      }
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorUsuario(null);
    setExitoUsuario(null);
    if (!usuarioNombre.trim() || !usuarioEmail.trim() || !usuarioPassword.trim()) {
      setErrorUsuario('Todos los campos son requeridos.');
      return;
    }
    if (usuarioPassword.length < 8) {
      setErrorUsuario('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    try {
      await crearUsuarioMutation.mutateAsync({
        nombre: usuarioNombre.trim(),
        email: usuarioEmail.trim(),
        password: usuarioPassword,
        rol: usuarioRol,
      });
      setExitoUsuario('¡Usuario registrado exitosamente!');
      setUsuarioNombre('');
      setUsuarioEmail('');
      setUsuarioPassword('');
      setTimeout(() => setExitoUsuario(null), 3000);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorUsuario(errorObj?.message || 'Error al crear la cuenta.');
    }
  };

  const handleEliminarUsuario = async (id: number, nombre: string) => {
    if (window.confirm(`¿Eliminar la cuenta del usuario "${nombre}"? Esta acción es irreversible.`)) {
      try {
        await eliminarUsuarioMutation.mutateAsync(id);
      } catch {
        alert('Error al eliminar usuario.');
      }
    }
  };

  return (
    <div className="modulos-hub-page">
      {/* Encabezado Principal */}
      <header className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div className="page-header-content">
          <span className="badge badge-primary" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
            ⚡ Centro Integral de Gestión Deportiva
          </span>
          <h1 className="page-title">Módulos Rápidos</h1>
          <p className="page-subtitle text-muted">
            Acceso unificado con arquitectura "Crear Arriba / Listar Abajo" para los 12 módulos del recinto
          </p>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <section className="kpi-stats-grid" aria-label="Indicadores Generales">
        <button
          type="button"
          onClick={() => cambiarTab('canchas')}
          className={`kpi-stat-card ${tabActiva === 'canchas' ? 'active' : ''}`}
        >
          <div className="kpi-icon-wrap">⚽</div>
          <div className="kpi-data">
            <span className="kpi-value">{countsMap.canchas}</span>
            <span className="kpi-label">Canchas</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => cambiarTab('sedes')}
          className={`kpi-stat-card ${tabActiva === 'sedes' ? 'active' : ''}`}
        >
          <div className="kpi-icon-wrap">🏢</div>
          <div className="kpi-data">
            <span className="kpi-value">{countsMap.sedes}</span>
            <span className="kpi-label">Sedes</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => cambiarTab('reservas')}
          className={`kpi-stat-card ${tabActiva === 'reservas' ? 'active' : ''}`}
        >
          <div className="kpi-icon-wrap">📅</div>
          <div className="kpi-data">
            <span className="kpi-value">{countsMap.reservas}</span>
            <span className="kpi-label">Reservas</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => cambiarTab('pagos')}
          className={`kpi-stat-card ${tabActiva === 'pagos' ? 'active' : ''}`}
        >
          <div className="kpi-icon-wrap">💳</div>
          <div className="kpi-data">
            <span className="kpi-value">{countsMap.pagos}</span>
            <span className="kpi-label">Pagos</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => cambiarTab('mantenimientos')}
          className={`kpi-stat-card ${tabActiva === 'mantenimientos' ? 'active' : ''}`}
        >
          <div className="kpi-icon-wrap">🔧</div>
          <div className="kpi-data">
            <span className="kpi-value">{countsMap.mantenimientos}</span>
            <span className="kpi-label">Mantenimientos</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => cambiarTab('resenas')}
          className={`kpi-stat-card ${tabActiva === 'resenas' ? 'active' : ''}`}
        >
          <div className="kpi-icon-wrap">⭐</div>
          <div className="kpi-data">
            <span className="kpi-value">{countsMap.resenas}</span>
            <span className="kpi-label">Reseñas</span>
          </div>
        </button>
      </section>

      {/* Disposición Ergonómica de Dos Columnas */}
      <div className="modulos-hub-layout">
        {/* Barra Lateral Navegadora */}
        <aside className="modulos-sidebar" aria-label="Navegador de Módulos Rápidos">
          {/* Buscador de Módulos */}
          <div className="modulos-search-box">
            <label htmlFor="buscar-modulo" className="sr-only">
              Buscar módulo o recurso
            </label>
            <input
              id="buscar-modulo"
              type="search"
              className="modulos-search-input"
              placeholder="🔍 Buscar módulo o servicio..."
              value={busquedaModulo}
              onChange={(e) => setBusquedaModulo(e.target.value)}
            />
          </div>

          {/* Filtros por Categoría */}
          <nav className="modulos-category-chips" aria-label="Filtrar por categoría">
            <button
              type="button"
              className={`category-chip ${categoriaSeleccionada === 'todos' ? 'active' : ''}`}
              onClick={() => handleSeleccionarCategoria('todos')}
            >
              Todos (12)
            </button>
            <button
              type="button"
              className={`category-chip ${categoriaSeleccionada === 'instalaciones' ? 'active' : ''}`}
              onClick={() => handleSeleccionarCategoria('instalaciones')}
            >
              🏟️ Instalaciones
            </button>
            <button
              type="button"
              className={`category-chip ${categoriaSeleccionada === 'operaciones' ? 'active' : ''}`}
              onClick={() => handleSeleccionarCategoria('operaciones')}
            >
              📅 Operaciones
            </button>
            <button
              type="button"
              className={`category-chip ${categoriaSeleccionada === 'servicios' ? 'active' : ''}`}
              onClick={() => handleSeleccionarCategoria('servicios')}
            >
              🛠️ Servicios
            </button>
            {esAdmin && (
              <button
                type="button"
                className={`category-chip ${categoriaSeleccionada === 'administracion' ? 'active' : ''}`}
                onClick={() => handleSeleccionarCategoria('administracion')}
              >
                👥 Administración
              </button>
            )}
          </nav>

          {/* Lista de Botones de Módulos */}
          <ul className="modulos-nav-list" role="tablist" aria-orientation="vertical">
            {modulosFiltrados.map((m) => {
              const count = countsMap[m.id];
              const estaActivo = tabActiva === m.id;
              return (
                <li key={m.id} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    id={`tab-${m.id}`}
                    aria-selected={estaActivo}
                    aria-controls={`panel-${m.id}`}
                    className={`modulo-nav-item-btn ${estaActivo ? 'active' : ''}`}
                    onClick={() => cambiarTab(m.id)}
                  >
                    <span className="modulo-nav-item-left">
                      <span aria-hidden="true">{m.icono}</span>
                      <span>{m.nombre}</span>
                    </span>
                    <span className="modulo-nav-item-badge">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Área de Trabajo del Módulo: CREAR ARRIBA + LISTA ABAJO */}
        <main className="modulos-content-area">
          <div className="tab-content-container">
            {/* 1. CANCHAS */}
            {tabActiva === 'canchas' && (
              <section id="panel-canchas" role="tabpanel" aria-labelledby="tab-canchas">
                <div className="section-title-bar">
                  <div>
                    <h2>⚽ Canchas Deportivas</h2>
                    <span className="text-muted text-sm">Registra una cancha arriba y filtra o gestiona el catálogo abajo</span>
                  </div>
                </div>

                {/* CREAR ARRIBA */}
                {puedeGestionar && (
                  <form onSubmit={handleCrearCancha} className="form-card" style={{ marginBottom: '1.75rem', maxWidth: '100%' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                      ➕ Registrar Nueva Cancha Deportiva
                    </h3>
                    {errorCancha && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{errorCancha}</div>}
                    {exitoCancha && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{exitoCancha}</div>}
                    <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label htmlFor="cancha-numero-input">Número de Cancha *</label>
                        <input
                          id="cancha-numero-input"
                          type="number"
                          min="1"
                          placeholder="Ej. 1"
                          value={canchaNumero}
                          onChange={(e) => setCanchaNumero(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cancha-sede-select">Sede del Recinto *</label>
                        <select
                          id="cancha-sede-select"
                          value={canchaSedeId || (sedesQuery.data?.[0]?.id ?? 0)}
                          onChange={(e) => setCanchaSedeId(Number(e.target.value))}
                        >
                          {sedesQuery.data?.map((s) => (
                            <option key={s.id} value={s.id}>{s.nombre} ({s.direccion})</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="cancha-tipo-select">Disciplina / Tipo *</label>
                        <select
                          id="cancha-tipo-select"
                          value={canchaTipoId || (tiposQuery.data?.[0]?.id ?? 0)}
                          onChange={(e) => setCanchaTipoId(Number(e.target.value))}
                        >
                          {tiposQuery.data?.map((t) => (
                            <option key={t.id} value={t.id}>{t.nombre} - ${t.precioPorHora.toLocaleString('es-CL')}/h</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="cancha-estado-select">Estado Operativo *</label>
                        <select
                          id="cancha-estado-select"
                          value={canchaEstado}
                          onChange={(e) => setCanchaEstado(e.target.value as 'Disponible' | 'Mantenimiento' | 'Fuera de servicio')}
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="Mantenimiento">Mantenimiento</option>
                          <option value="Fuera de servicio">Fuera de servicio</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={crearCanchaMutation.isPending}>
                        {crearCanchaMutation.isPending ? 'Guardando Cancha...' : 'Guardar Cancha'}
                      </button>
                    </div>
                  </form>
                )}

                {/* FILTROS DE BÚSQUEDA RÁPIDA */}
                <div className="filters-card" style={{ marginBottom: '1.25rem' }}>
                  <div className="filters-grid">
                    <div className="form-group">
                      <label htmlFor="busqueda-canchas">🔍 Búsqueda rápida</label>
                      <input
                        id="busqueda-canchas"
                        type="search"
                        placeholder="Buscar por número, sede, tipo o estado..."
                        value={canchasBusqueda}
                        onChange={(e) => setCanchasBusqueda(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="filtro-sede-canchas">Sede</label>
                      <select id="filtro-sede-canchas" value={canchasFiltroSede} onChange={(e) => setCanchasFiltroSede(e.target.value)}>
                        <option value="">Todas las sedes</option>
                        {sedesQuery.data?.map((s) => (
                          <option key={s.id} value={s.id.toString()}>{s.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filtro-tipo-canchas">Tipo de Cancha</label>
                      <select id="filtro-tipo-canchas" value={canchasFiltroTipo} onChange={(e) => setCanchasFiltroTipo(e.target.value)}>
                        <option value="">Todos los tipos</option>
                        {tiposQuery.data?.map((t) => (
                          <option key={t.id} value={t.id.toString()}>{t.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="filtro-estado-canchas">Estado</label>
                      <select id="filtro-estado-canchas" value={canchasFiltroEstado} onChange={(e) => setCanchasFiltroEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        <option value="Disponible">Disponible</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Fuera de servicio">Fuera de servicio</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* LISTA ABAJO */}
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-md)', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  📋 Lista de Canchas Registradas ({canchasFiltradas.length})
                </h3>

                {canchasQuery.isLoading && (
                  <div className="loading-container"><span className="spinner" aria-hidden="true" /><span>Cargando canchas...</span></div>
                )}
                {canchasQuery.isError && (
                  <div className="alert alert-danger" role="alert">⚠️ Error al cargar el catálogo de canchas.</div>
                )}
                {canchasFiltradas.length === 0 && !canchasQuery.isLoading && !canchasQuery.isError && (
                  <div className="empty-state">
                    <span className="empty-icon">⚽</span>
                    <h3>No se encontraron canchas con los filtros aplicados</h3>
                    <p className="text-muted">Crea una nueva cancha arriba o restablece los filtros.</p>
                  </div>
                )}
                {canchasFiltradas.length > 0 && (
                  <div className="table-responsive">
                    <table className="data-table" aria-label="Tabla de Canchas">
                      <thead>
                        <tr>
                          <th scope="col">ID</th>
                          <th scope="col">N°</th>
                          <th scope="col">Sede</th>
                          <th scope="col">Tipo</th>
                          <th scope="col">Precio / Hora</th>
                          <th scope="col">Estado</th>
                          <th scope="col">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagCanchas.datosPagina.map((c) => (
                          <tr key={c.id}>
                            <td className="font-mono text-muted">#{c.id}</td>
                            <td className="font-bold">Cancha {c.numero}</td>
                            <td>{c.sedeNombre}</td>
                            <td>{c.tipoCanchaNombre}</td>
                            <td className="font-bold">${c.precioPorHora.toLocaleString('es-CL')}</td>
                            <td>
                              <span className={`badge badge-${c.estado.toLowerCase().replace(/\s+/g, '-')}`}>
                                {c.estado}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                <Link to={`/canchas/${c.id}`} className="btn btn-outline btn-sm">
                                  Ver
                                </Link>
                                {puedeGestionar && (
                                  <>
                                    <Link to={`/canchas/${c.id}/editar`} className="btn btn-secondary btn-sm">
                                      Editar
                                    </Link>
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleEliminarCancha(c.id, c.numero)}
                                      disabled={eliminarCanchaMutation.isPending}
                                    >
                                      Eliminar
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <PaginacionControls {...pagCanchas} etiqueta="Canchas" />
                  </div>
                )}
              </section>
            )}

            {/* 2. TIPOS DE CANCHA */}
            {tabActiva === 'tipos' && (
              <section id="panel-tipos" role="tabpanel" aria-labelledby="tab-tipos">
                <div className="section-title-bar">
                  <div>
                    <h2>🏷️ Tipos de Cancha y Disciplinas</h2>
                    <span className="text-muted text-sm">Define disciplinas deportivas y tarifas horarias</span>
                  </div>
                </div>

                {/* CREAR ARRIBA */}
                {puedeGestionar && (
                  <form onSubmit={handleCrearTipo} className="form-card" style={{ marginBottom: '1.75rem', maxWidth: '100%' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                      ➕ Registrar Nuevo Tipo de Cancha
                    </h3>
                    {errorTipo && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{errorTipo}</div>}
                    {exitoTipo && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{exitoTipo}</div>}
                    <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label htmlFor="tipo-nombre-input">Nombre de la Disciplina / Tipo *</label>
                        <input
                          id="tipo-nombre-input"
                          type="text"
                          placeholder="Ej. Pádel Techado, Fútbol 7, Tenis Arcilla"
                          value={tipoNombre}
                          onChange={(e) => setTipoNombre(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="tipo-precio-input">Precio Referencial por Hora (CLP) *</label>
                        <input
                          id="tipo-precio-input"
                          type="number"
                          step="500"
                          min="1000"
                          value={tipoPrecio}
                          onChange={(e) => setTipoPrecio(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="tipo-desc-input">Descripción / Características</label>
                      <textarea
                        id="tipo-desc-input"
                        rows={2}
                        placeholder="Detalles técnicos, iluminación, tipo de césped o arcilla..."
                        value={tipoDescripcion}
                        onChange={(e) => setTipoDescripcion(e.target.value)}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={crearTipoMutation.isPending}>
                        {crearTipoMutation.isPending ? 'Guardando...' : 'Guardar Tipo de Cancha'}
                      </button>
                    </div>
                  </form>
                )}

                {/* LISTA ABAJO */}
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-md)', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  📋 Lista de Tipos de Cancha ({tiposQuery.data?.length ?? 0})
                </h3>

                {tiposQuery.isLoading && (
                  <div className="loading-container"><span className="spinner" aria-hidden="true" /><span>Cargando tipos de cancha...</span></div>
                )}
                {tiposQuery.isError && (
                  <div className="alert alert-danger" role="alert">⚠️ Error al cargar los tipos de cancha.</div>
                )}
                {tiposQuery.data && tiposQuery.data.length === 0 && !tiposQuery.isLoading && (
                  <div className="empty-state">
                    <span className="empty-icon">🏷️</span>
                    <h3>No hay tipos de cancha registrados</h3>
                    <p className="text-muted">Crea una nueva disciplina en el formulario de arriba.</p>
                  </div>
                )}
                {tiposQuery.data && tiposQuery.data.length > 0 && (
                  <div className="table-responsive">
                    <table className="data-table" aria-label="Tabla de Tipos de Cancha">
                      <thead>
                        <tr>
                          <th scope="col">ID</th>
                          <th scope="col">Disciplina</th>
                          <th scope="col">Descripción</th>
                          <th scope="col">Tarifa / Hora</th>
                          {puedeGestionar && <th scope="col">Acciones</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {pagTipos.datosPagina.map((t) => (
                          <tr key={t.id}>
                            <td className="font-mono text-muted">#{t.id}</td>
                            <td className="font-bold">{t.nombre}</td>
                            <td>{t.descripcion || 'Sin descripción'}</td>
                            <td className="font-bold text-success">${t.precioPorHora.toLocaleString('es-CL')}</td>
                            {puedeGestionar && (
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleEliminarTipo(t.id, t.nombre)}
                                  disabled={eliminarTipoMutation.isPending}
                                >
                                  Eliminar
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <PaginacionControls {...pagTipos} etiqueta="Tipos de Cancha" />
                  </div>
                )}
              </section>
            )}

            {/* 3. SEDES */}
            {tabActiva === 'sedes' && (
              <section id="panel-sedes" role="tabpanel" aria-labelledby="tab-sedes">
                <div className="section-title-bar">
                  <div>
                    <h2>🏢 Sedes del Recinto Deportivo</h2>
                    <span className="text-muted text-sm">Registra una sede arriba y visualiza las existentes abajo</span>
                  </div>
                </div>

                {/* CREAR ARRIBA */}
                {esAdmin && (
                  <form onSubmit={handleCrearSede} className="form-card" style={{ marginBottom: '1.75rem', maxWidth: '100%' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                      ➕ Registrar Nueva Sede
                    </h3>
                    {errorSede && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{errorSede}</div>}
                    {exitoSede && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{exitoSede}</div>}
                    <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label htmlFor="sede-nombre">Nombre de la Sede *</label>
                        <input id="sede-nombre" type="text" placeholder="Ej. Sede Cordillera" value={sedeNombre} onChange={(e) => setSedeNombre(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="sede-direccion">Dirección *</label>
                        <input id="sede-direccion" type="text" placeholder="Ej. Av. Marathon 5300, Macul" value={sedeDireccion} onChange={(e) => setSedeDireccion(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="sede-telefono">Teléfono (Opcional)</label>
                        <input id="sede-telefono" type="tel" placeholder="Ej. +56 9 8765 4321" value={sedeTelefono} onChange={(e) => setSedeTelefono(e.target.value)} />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={crearSedeMutation.isPending}>
                        {crearSedeMutation.isPending ? 'Guardando Sede...' : 'Guardar Sede'}
                      </button>
                    </div>
                  </form>
                )}

                {/* LISTA ABAJO */}
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-md)', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  📋 Lista de Sedes Registradas ({sedesQuery.data?.length ?? 0})
                </h3>

                {sedesQuery.isLoading && (
                  <div className="loading-container"><span className="spinner" aria-hidden="true" /><span>Cargando sedes...</span></div>
                )}
                {sedesQuery.isError && (
                  <div className="alert alert-danger" role="alert">⚠️ Error al cargar las sedes.</div>
                )}
                {sedesQuery.data && sedesQuery.data.length === 0 && !sedesQuery.isLoading && (
                  <div className="empty-state">
                    <span className="empty-icon">🏢</span>
                    <h3>No hay sedes registradas</h3>
                    <p className="text-muted">Ingresa la primera sede en el formulario de arriba.</p>
                  </div>
                )}
                {sedesQuery.data && sedesQuery.data.length > 0 && (
                  <div className="table-responsive">
                    <table className="data-table" aria-label="Tabla de Sedes">
                      <thead>
                        <tr>
                          <th scope="col">ID</th>
                          <th scope="col">Nombre</th>
                          <th scope="col">Dirección</th>
                          <th scope="col">Teléfono</th>
                          {esAdmin && <th scope="col">Acciones</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {pagSedes.datosPagina.map((sede) => (
                          <tr key={sede.id}>
                            <td className="font-mono text-muted">#{sede.id}</td>
                            <td className="font-bold">{sede.nombre}</td>
                            <td>📍 {sede.direccion}</td>
                            <td>{sede.telefono ? `📞 ${sede.telefono}` : '—'}</td>
                            {esAdmin && (
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleEliminarSede(sede.id, sede.nombre)}
                                  disabled={eliminarSedeMutation.isPending}
                                >
                                  Eliminar
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <PaginacionControls {...pagSedes} etiqueta="Sedes" />
                  </div>
                )}
              </section>
            )}

            {/* 4. RESERVAS */}
            {tabActiva === 'reservas' && (
              <section id="panel-reservas" role="tabpanel" aria-labelledby="tab-reservas">
                <div className="section-title-bar">
                  <div>
                    <h2>📅 Reservas de Canchas</h2>
                    <span className="text-muted text-sm">Crea una reserva arriba y consulta el listado en tiempo real abajo</span>
                  </div>
                </div>

                {/* CREAR ARRIBA */}
                <form onSubmit={handleCrearReserva} className="form-card" style={{ marginBottom: '1.75rem', maxWidth: '100%' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                    ➕ Registrar Nueva Reserva
                  </h3>
                  {errorReserva && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{errorReserva}</div>}
                  {exitoReserva && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{exitoReserva}</div>}
                  <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="reserva-cancha">Seleccionar Cancha *</label>
                      <select id="reserva-cancha" value={reservaCanchaId || (canchasQuery.data?.[0]?.id ?? 0)} onChange={(e) => setReservaCanchaId(Number(e.target.value))}>
                        {canchasQuery.data?.map((c) => (
                          <option key={c.id} value={c.id}>
                            Cancha #{c.numero} ({c.tipoCanchaNombre} - {c.sedeNombre}) - ${c.precioPorHora.toLocaleString('es-CL')}/h
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="reserva-inicio">Fecha y Hora de Inicio *</label>
                      <input id="reserva-inicio" type="datetime-local" value={reservaInicio} onChange={(e) => setReservaInicio(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="reserva-fin">Fecha y Hora de Fin *</label>
                      <input id="reserva-fin" type="datetime-local" value={reservaFin} onChange={(e) => setReservaFin(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={crearReservaMutation.isPending}>
                      {crearReservaMutation.isPending ? 'Guardando Reserva...' : 'Confirmar Reserva'}
                    </button>
                  </div>
                </form>

                {/* LISTA ABAJO */}
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-md)', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  📋 Lista de Reservas Registradas ({reservasQuery.data?.length ?? 0})
                </h3>

                {reservasQuery.isLoading && (
                  <div className="loading-container"><span className="spinner" aria-hidden="true" /><span>Cargando reservas...</span></div>
                )}
                {reservasQuery.isError && (
                  <div className="alert alert-danger" role="alert">⚠️ Error al cargar las reservas.</div>
                )}
                {reservasQuery.data && reservasQuery.data.length === 0 && !reservasQuery.isLoading && (
                  <div className="empty-state">
                    <span className="empty-icon">📅</span>
                    <h3>No hay reservas registradas</h3>
                    <p className="text-muted">Registra tu primera reserva seleccionando una cancha y horario arriba.</p>
                  </div>
                )}
                {reservasQuery.data && reservasQuery.data.length > 0 && (
                  <div className="table-responsive">
                    <table className="data-table" aria-label="Tabla de Reservas">
                      <thead>
                        <tr>
                          <th scope="col">ID</th>
                          <th scope="col">Cancha</th>
                          <th scope="col">Cliente</th>
                          <th scope="col">Inicio</th>
                          <th scope="col">Fin</th>
                          <th scope="col">Estado</th>
                          <th scope="col">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagReservas.datosPagina.map((r) => (
                          <tr key={r.id}>
                            <td className="font-mono text-muted">#{r.id}</td>
                            <td className="font-bold">Cancha {r.canchaNumero || r.canchaId}</td>
                            <td>{r.usuarioNombre || `Usuario #${r.usuarioId}`}</td>
                            <td>{new Date(r.fechaInicio).toLocaleString('es-CL')}</td>
                            <td>{new Date(r.fechaFin).toLocaleString('es-CL')}</td>
                            <td><span className={`badge badge-${r.estado.toLowerCase()}`}>{r.estado}</span></td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleEliminarReserva(r.id)}
                                disabled={eliminarReservaMutation.isPending}
                              >
                                Cancelar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <PaginacionControls {...pagReservas} etiqueta="Reservas" />
                  </div>
                )}
              </section>
            )}

            {/* 5. PAGOS */}
            {tabActiva === 'pagos' && (
              <section id="panel-pagos" role="tabpanel" aria-labelledby="tab-pagos">
                <div className="section-title-bar">
                  <div>
                    <h2>💳 Registro de Pagos</h2>
                    <span className="text-muted text-sm">Registra un pago arriba y consulta el historial abajo</span>
                  </div>
                </div>

                {/* CREAR ARRIBA */}
                <form onSubmit={handleCrearPago} className="form-card" style={{ marginBottom: '1.75rem', maxWidth: '100%' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                    ➕ Registrar Nuevo Pago de Reserva
                  </h3>
                  {errorPago && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{errorPago}</div>}
                  {exitoPago && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{exitoPago}</div>}
                  <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="pago-reserva">Asociar a Reserva *</label>
                      <select id="pago-reserva" value={pagoReservaId || (reservasQuery.data?.[0]?.id ?? 0)} onChange={(e) => setPagoReservaId(Number(e.target.value))}>
                        {reservasQuery.data?.map((r) => (
                          <option key={r.id} value={r.id}>
                            Reserva #{r.id} - Cancha {r.canchaNumero || r.canchaId} ({r.usuarioNombre || `Usuario ${r.usuarioId}`}) [{r.estado}]
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="pago-monto">Monto en CLP ($) *</label>
                      <input id="pago-monto" type="number" min="1000" step="500" value={pagoMonto} onChange={(e) => setPagoMonto(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pago-metodo">Método de Pago *</label>
                      <select id="pago-metodo" value={pagoMetodo} onChange={(e) => setPagoMetodo(e.target.value as 'Efectivo' | 'Tarjeta' | 'Transferencia')}>
                        <option value="Tarjeta">💳 Tarjeta (Débito / Crédito)</option>
                        <option value="Transferencia">🏦 Transferencia Bancaria</option>
                        <option value="Efectivo">💵 Efectivo</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={crearPagoMutation.isPending}>
                      {crearPagoMutation.isPending ? 'Procesando Pago...' : 'Registrar Pago'}
                    </button>
                  </div>
                </form>

                {/* LISTA ABAJO */}
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-md)', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  📋 Lista de Pagos Registrados ({pagosQuery.data?.length ?? 0})
                </h3>

                {pagosQuery.isLoading && (
                  <div className="loading-container"><span className="spinner" aria-hidden="true" /><span>Cargando pagos...</span></div>
                )}
                {pagosQuery.isError && (
                  <div className="alert alert-danger" role="alert">⚠️ Error al cargar las transacciones de pago.</div>
                )}
                {pagosQuery.data && pagosQuery.data.length === 0 && !pagosQuery.isLoading && (
                  <div className="empty-state">
                    <span className="empty-icon">💳</span>
                    <h3>Sin transacciones registradas</h3>
                    <p className="text-muted">Registra el pago de una reserva en el formulario de arriba.</p>
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
                          {puedeGestionar && <th scope="col">Acciones</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {pagPagos.datosPagina.map((p) => (
                          <tr key={p.id}>
                            <td className="font-mono text-muted">#{p.id}</td>
                            <td>Reserva #{p.reservaId}</td>
                            <td>{p.usuarioNombre || 'Cliente'}</td>
                            <td className="font-bold text-success">${p.monto.toLocaleString('es-CL')}</td>
                            <td>{p.metodoPago}</td>
                            <td><span className={`badge badge-${p.estado.toLowerCase()}`}>{p.estado}</span></td>
                            <td>{p.fechaPago ? new Date(p.fechaPago).toLocaleDateString('es-CL') : '—'}</td>
                            {puedeGestionar && (
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleEliminarPago(p.id)}
                                  disabled={eliminarPagoMutation.isPending}
                                >
                                  Eliminar
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <PaginacionControls {...pagPagos} etiqueta="Pagos" />
                  </div>
                )}
              </section>
            )}

            {/* 6. COMPROBANTES */}
            {tabActiva === 'comprobantes' && (
              <section id="panel-comprobantes" role="tabpanel" aria-labelledby="tab-comprobantes">
                <div className="section-title-bar">
                  <div>
                    <h2>📄 Comprobantes Electrónicos</h2>
                    <span className="text-muted text-sm">Emite comprobantes fiscales arriba y revisa la emisión abajo</span>
                  </div>
                </div>

                {/* CREAR ARRIBA */}
                {puedeGestionar && (
                  <form onSubmit={handleCrearComprobante} className="form-card" style={{ marginBottom: '1.75rem', maxWidth: '100%' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                      ➕ Emitir Comprobante Fiscal
                    </h3>
                    {errorComprobante && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{errorComprobante}</div>}
                    {exitoComprobante && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{exitoComprobante}</div>}
                    <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label htmlFor="comprobante-pago">Seleccionar Pago *</label>
                        <select id="comprobante-pago" value={comprobantePagoId || (pagosQuery.data?.[0]?.id ?? 0)} onChange={(e) => setComprobantePagoId(Number(e.target.value))}>
                          {pagosQuery.data?.map((p) => (
                            <option key={p.id} value={p.id}>
                              Pago #{p.id} - ${p.monto.toLocaleString('es-CL')} (Reserva #{p.reservaId} - {p.usuarioNombre || 'Cliente'})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="comprobante-numero">N° de Comprobante *</label>
                        <input id="comprobante-numero" type="text" placeholder="Ej. B001-00045" value={comprobanteNumero} onChange={(e) => setComprobanteNumero(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="comprobante-tipo">Tipo Tributario *</label>
                        <select id="comprobante-tipo" value={comprobanteTipo} onChange={(e) => setComprobanteTipo(e.target.value as 'Boleta' | 'Factura')}>
                          <option value="Boleta">Boleta Electrónica</option>
                          <option value="Factura">Factura Electrónica</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={crearComprobanteMutation.isPending}>
                        {crearComprobanteMutation.isPending ? 'Emitiendo...' : 'Emitir Comprobante'}
                      </button>
                    </div>
                  </form>
                )}

                {/* LISTA ABAJO */}
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-md)', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  📋 Lista de Comprobantes Emitidos ({comprobantesQuery.data?.length ?? 0})
                </h3>

                {comprobantesQuery.isLoading && (
                  <div className="loading-container"><span className="spinner" aria-hidden="true" /><span>Cargando comprobantes...</span></div>
                )}
                {comprobantesQuery.isError && (
                  <div className="alert alert-danger" role="alert">⚠️ Error al cargar los comprobantes emitidos.</div>
                )}
                {comprobantesQuery.data && comprobantesQuery.data.length === 0 && !comprobantesQuery.isLoading && (
                  <div className="empty-state">
                    <span className="empty-icon">📄</span>
                    <h3>No hay comprobantes emitidos</h3>
                    <p className="text-muted">Genera una boleta o factura a partir de un pago registrado arriba.</p>
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
                          {puedeGestionar && <th scope="col">Acciones</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {pagComprobantes.datosPagina.map((c) => (
                          <tr key={c.id}>
                            <td className="font-mono text-muted">#{c.id}</td>
                            <td className="font-bold">{c.numeroComprobante}</td>
                            <td><span className="badge badge-disponible">{c.tipo}</span></td>
                            <td>Pago #{c.pagoId}</td>
                            <td className="font-bold text-success">{c.monto ? `$${c.monto.toLocaleString('es-CL')}` : '—'}</td>
                            <td>{new Date(c.fechaEmision).toLocaleDateString('es-CL')}</td>
                            {puedeGestionar && (
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleEliminarComprobante(c.id)}
                                  disabled={eliminarComprobanteMutation.isPending}
                                >
                                  Eliminar
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <PaginacionControls {...pagComprobantes} etiqueta="Comprobantes" />
                  </div>
                )}
              </section>
            )}

            {/* 7. HORARIOS */}
            {tabActiva === 'horarios' && (
              <section id="panel-horarios" role="tabpanel" aria-labelledby="tab-horarios">
                <div className="section-title-bar">
                  <div>
                    <h2>⏰ Horarios de Atención</h2>
                    <span className="text-muted text-sm">Define franjas horarias arriba y consúltalas abajo</span>
                  </div>
                </div>

                {/* CREAR ARRIBA */}
                {puedeGestionar && (
                  <form onSubmit={handleCrearHorario} className="form-card" style={{ marginBottom: '1.75rem', maxWidth: '100%' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                      ➕ Definir Horario de Cancha
                    </h3>
                    {errorHorario && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{errorHorario}</div>}
                    {exitoHorario && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{exitoHorario}</div>}
                    <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label htmlFor="horario-cancha">Cancha *</label>
                        <select id="horario-cancha" value={horarioCanchaId || (canchasQuery.data?.[0]?.id ?? 0)} onChange={(e) => setHorarioCanchaId(Number(e.target.value))}>
                          {canchasQuery.data?.map((c) => (
                            <option key={c.id} value={c.id}>Cancha #{c.numero} ({c.tipoCanchaNombre} - {c.sedeNombre})</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="horario-dia">Día *</label>
                        <select id="horario-dia" value={horarioDia} onChange={(e) => setHorarioDia(Number(e.target.value))}>
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
                        <label htmlFor="horario-apertura">Apertura *</label>
                        <input id="horario-apertura" type="time" value={horarioApertura} onChange={(e) => setHorarioApertura(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="horario-cierre">Cierre *</label>
                        <input id="horario-cierre" type="time" value={horarioCierre} onChange={(e) => setHorarioCierre(e.target.value)} required />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={crearHorarioMutation.isPending}>
                        {crearHorarioMutation.isPending ? 'Guardando...' : 'Guardar Horario'}
                      </button>
                    </div>
                  </form>
                )}

                {/* LISTA ABAJO */}
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-md)', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  📋 Lista de Horarios Programados ({horariosQuery.data?.length ?? 0})
                </h3>

                {horariosQuery.isLoading && (
                  <div className="loading-container"><span className="spinner" aria-hidden="true" /><span>Cargando horarios...</span></div>
                )}
                {horariosQuery.isError && (
                  <div className="alert alert-danger" role="alert">⚠️ Error al cargar los horarios de atención.</div>
                )}
                {horariosQuery.data && horariosQuery.data.length === 0 && !horariosQuery.isLoading && (
                  <div className="empty-state">
                    <span className="empty-icon">⏰</span>
                    <h3>No hay horarios asignados</h3>
                    <p className="text-muted">Define los turnos de apertura y cierre para las canchas arriba.</p>
                  </div>
                )}
                {horariosQuery.data && horariosQuery.data.length > 0 && (
                  <div className="table-responsive">
                    <table className="data-table" aria-label="Tabla de Horarios">
                      <thead>
                        <tr>
                          <th scope="col">ID</th>
                          <th scope="col">Cancha</th>
                          <th scope="col">Día</th>
                          <th scope="col">Hora Apertura</th>
                          <th scope="col">Hora Cierre</th>
                          {puedeGestionar && <th scope="col">Acciones</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {pagHorarios.datosPagina.map((h) => (
                          <tr key={h.id}>
                            <td className="font-mono text-muted">#{h.id}</td>
                            <td className="font-bold">Cancha {h.canchaNumero || h.canchaId}</td>
                            <td><span className="badge badge-disponible">{diasSemana[h.diaSemana] || `Día ${h.diaSemana}`}</span></td>
                            <td>🕒 {h.horaApertura}</td>
                            <td>🔒 {h.horaCierre}</td>
                            {puedeGestionar && (
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleEliminarHorario(h.id)}
                                  disabled={eliminarHorarioMutation.isPending}
                                >
                                  Eliminar
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <PaginacionControls {...pagHorarios} etiqueta="Horarios" />
                  </div>
                )}
              </section>
            )}

            {/* 8. MANTENIMIENTOS */}
            {tabActiva === 'mantenimientos' && (
              <section id="panel-mantenimientos" role="tabpanel" aria-labelledby="tab-mantenimientos">
                <div className="section-title-bar">
                  <div>
                    <h2>🔧 Bitácora de Mantenimientos</h2>
                    <span className="text-muted text-sm">Registra una orden técnica arriba y consúltalas abajo</span>
                  </div>
                </div>

                {!puedeGestionar ? (
                  <div className="alert alert-info" role="alert">
                    ℹ️ El módulo de mantenimientos técnicos está reservado para Trabajadores y Administradores.
                  </div>
                ) : (
                  <>
                    {/* CREAR ARRIBA */}
                    <form onSubmit={handleCrearMantenimiento} className="form-card" style={{ marginBottom: '1.75rem', maxWidth: '100%' }}>
                      <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                        ➕ Registrar Mantenimiento Técnico
                      </h3>
                      {errorMantenimiento && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{errorMantenimiento}</div>}
                      {exitoMantenimiento && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{exitoMantenimiento}</div>}
                      <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                        <div className="form-group">
                          <label htmlFor="mant-cancha">Cancha a Intervenir *</label>
                          <select id="mant-cancha" value={mantenimientoCanchaId || (canchasQuery.data?.[0]?.id ?? 0)} onChange={(e) => setMantenimientoCanchaId(Number(e.target.value))}>
                            {canchasQuery.data?.map((c) => (
                              <option key={c.id} value={c.id}>Cancha #{c.numero} ({c.tipoCanchaNombre} - {c.sedeNombre})</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="mant-trabajador">Encargado Técnico *</label>
                          <select id="mant-trabajador" value={mantenimientoTrabajadorId || (trabajadoresQuery.data?.[0]?.id ?? 0)} onChange={(e) => setMantenimientoTrabajadorId(Number(e.target.value))}>
                            {trabajadoresQuery.data?.map((t) => (
                              <option key={t.id} value={t.id}>{t.usuarioNombre || t.nombre || `Personal #${t.id}`} ({t.cargo})</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="mant-inicio">Fecha Inicio *</label>
                          <input id="mant-inicio" type="datetime-local" value={mantenimientoInicio} onChange={(e) => setMantenimientoInicio(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="mant-fin">Fecha Término Estimada</label>
                          <input id="mant-fin" type="datetime-local" value={mantenimientoFin} onChange={(e) => setMantenimientoFin(e.target.value)} />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label htmlFor="mant-desc">Descripción del Trabajo Técnico *</label>
                        <textarea id="mant-desc" rows={2} placeholder="Reparación de césped, nivelación de cancha, revisión de luces..." value={mantenimientoDescripcion} onChange={(e) => setMantenimientoDescripcion(e.target.value)} required />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary btn-sm" disabled={crearMantenimientoMutation.isPending}>
                          {crearMantenimientoMutation.isPending ? 'Guardando...' : 'Crear Orden Técnica'}
                        </button>
                      </div>
                    </form>

                    {/* LISTA ABAJO */}
                    <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-md)', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                      📋 Bitácora de Mantenimientos ({mantenimientosQuery.data?.length ?? 0})
                    </h3>

                    {mantenimientosQuery.isLoading && (
                      <div className="loading-container"><span className="spinner" aria-hidden="true" /><span>Cargando mantenimientos...</span></div>
                    )}
                    {mantenimientosQuery.isError && (
                      <div className="alert alert-danger" role="alert">⚠️ No se pudo obtener la bitácora de mantenimientos.</div>
                    )}
                    {mantenimientosQuery.data && mantenimientosQuery.data.length === 0 && !mantenimientosQuery.isLoading && (
                      <div className="empty-state">
                        <span className="empty-icon">🔧</span>
                        <h3>No hay mantenimientos activos</h3>
                        <p className="text-muted">Registra intervenciones técnicas o revisiones preventivas arriba.</p>
                      </div>
                    )}
                    {mantenimientosQuery.data && mantenimientosQuery.data.length > 0 && (
                      <div className="table-responsive">
                        <table className="data-table" aria-label="Tabla de Mantenimientos">
                          <thead>
                            <tr>
                              <th scope="col">ID</th>
                              <th scope="col">Cancha</th>
                              <th scope="col">Encargado</th>
                              <th scope="col">Descripción</th>
                              <th scope="col">Inicio</th>
                              <th scope="col">Fin</th>
                              {esAdmin && <th scope="col">Acciones</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {pagMantenimientos.datosPagina.map((m) => (
                              <tr key={m.id}>
                                <td className="font-mono text-muted">#{m.id}</td>
                                <td className="font-bold">Cancha {m.canchaNumero || m.canchaId}</td>
                                <td>{m.trabajadorNombre || `Técnico #${m.trabajadorId}`}</td>
                                <td>{m.descripcion}</td>
                                <td>{new Date(m.fechaInicio).toLocaleDateString('es-CL')}</td>
                                <td>{m.fechaFin ? new Date(m.fechaFin).toLocaleDateString('es-CL') : 'En progreso'}</td>
                                {esAdmin && (
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleEliminarMantenimiento(m.id)}
                                      disabled={eliminarMantenimientoMutation.isPending}
                                    >
                                      Eliminar
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <PaginacionControls {...pagMantenimientos} etiqueta="Mantenimientos" />
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            {/* 9. RESEÑAS */}
            {tabActiva === 'resenas' && (
              <section id="panel-resenas" role="tabpanel" aria-labelledby="tab-resenas">
                <div className="section-title-bar">
                  <div>
                    <h2>⭐ Reseñas de Clientes</h2>
                    <span className="text-muted text-sm">Publica tu opinión arriba y revisa las valoraciones abajo</span>
                  </div>
                </div>

                {/* CREAR ARRIBA */}
                <form onSubmit={handleCrearResena} className="form-card" style={{ marginBottom: '1.75rem', maxWidth: '100%' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                    ➕ Publicar Nueva Reseña
                  </h3>
                  {errorResena && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{errorResena}</div>}
                  {exitoResena && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{exitoResena}</div>}
                  <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="resena-reserva">Reserva a Calificar *</label>
                      <select id="resena-reserva" value={resenaReservaId || (reservasQuery.data?.[0]?.id ?? 0)} onChange={(e) => setResenaReservaId(Number(e.target.value))}>
                        {reservasQuery.data?.map((r) => (
                          <option key={r.id} value={r.id}>Reserva #{r.id} - Cancha {r.canchaNumero || r.canchaId} ({new Date(r.fechaInicio).toLocaleDateString('es-CL')})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="resena-calificacion">Calificación *</label>
                      <select id="resena-calificacion" value={resenaCalificacion} onChange={(e) => setResenaCalificacion(Number(e.target.value))}>
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Estrellas - Excelente)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Estrellas - Muy Buena)</option>
                        <option value={3}>⭐⭐⭐ (3 Estrellas - Buena)</option>
                        <option value={2}>⭐⭐ (2 Estrellas - Regular)</option>
                        <option value={1}>⭐ (1 Estrella - Insuficiente)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="resena-comentario">Comentario (Opcional)</label>
                    <textarea id="resena-comentario" rows={2} placeholder="Escribe tu opinión sobre el estado del recinto..." value={resenaComentario} onChange={(e) => setResenaComentario(e.target.value)} />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={crearResenaMutation.isPending}>
                      {crearResenaMutation.isPending ? 'Publicando...' : 'Publicar Reseña'}
                    </button>
                  </div>
                </form>

                {/* LISTA ABAJO */}
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-md)', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  📋 Lista de Reseñas de Clientes ({resenasQuery.data?.length ?? 0})
                </h3>

                {resenasQuery.isLoading && (
                  <div className="loading-container"><span className="spinner" aria-hidden="true" /><span>Cargando opiniones...</span></div>
                )}
                {resenasQuery.isError && (
                  <div className="alert alert-danger" role="alert">⚠️ Error al cargar las opiniones de los usuarios.</div>
                )}
                {resenasQuery.data && resenasQuery.data.length === 0 && !resenasQuery.isLoading && (
                  <div className="empty-state">
                    <span className="empty-icon">⭐</span>
                    <h3>Aún no se han publicado reseñas</h3>
                    <p className="text-muted">¡Sé el primero en calificar tu experiencia deportiva arriba!</p>
                  </div>
                )}
                {resenasQuery.data && resenasQuery.data.length > 0 && (
                  <div className="cards-grid">
                    {pagResenas.datosPagina.map((r) => (
                      <article key={r.id} className="cancha-card">
                        <header className="card-header">
                          <div>
                            <span className="card-id-tag font-mono">ID #{r.id}</span>
                            <h3>{r.usuarioNombre || 'Cliente'}</h3>
                          </div>
                          <span className="badge badge-primary">
                            {'★'.repeat(r.calificacion)}{'☆'.repeat(5 - r.calificacion)}
                          </span>
                        </header>
                        <div className="card-body">
                          <p className="resena-comment">"{r.comentario || 'Sin comentario escrito.'}"</p>
                          <p className="text-muted text-xs">Cancha {r.canchaNumero || r.canchaId} | {new Date(r.fecha).toLocaleDateString('es-CL')}</p>
                        </div>
                        {puedeGestionar && (
                          <footer className="card-footer" style={{ marginTop: '0.75rem' }}>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleEliminarResena(r.id)}
                              disabled={eliminarResenaMutation.isPending}
                            >
                              Eliminar Reseña
                            </button>
                          </footer>
                        )}
                      </article>
                    ))}
                  </div>
                )}
                {resenasQuery.data && resenasQuery.data.length > 0 && (
                  <PaginacionControls {...pagResenas} etiqueta="Reseñas" />
                )}
              </section>
            )}

            {/* 10. NOTIFICACIONES */}
            {tabActiva === 'notificaciones' && (
              <section id="panel-notificaciones" role="tabpanel" aria-labelledby="tab-notificaciones">
                <div className="section-title-bar">
                  <div>
                    <h2>🔔 Centro de Notificaciones</h2>
                    <span className="text-muted text-sm">Envía un aviso arriba y visualiza la bandeja abajo</span>
                  </div>
                </div>

                {/* CREAR ARRIBA */}
                {puedeGestionar && (
                  <form onSubmit={handleCrearNotificacion} className="form-card" style={{ marginBottom: '1.75rem', maxWidth: '100%' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                      ➕ Enviar Notificación a Usuario
                    </h3>
                    {errorNotificacion && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{errorNotificacion}</div>}
                    {exitoNotificacion && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{exitoNotificacion}</div>}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="notif-usuario">Usuario Destinatario *</label>
                      <select id="notif-usuario" value={notificacionUsuarioId || (usuariosQuery.data?.[0]?.id ?? 0)} onChange={(e) => setNotificacionUsuarioId(Number(e.target.value))}>
                        {usuariosQuery.data?.map((u) => (
                          <option key={u.id} value={u.id}>{u.nombre} ({u.email}) [{u.rol}]</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="notif-mensaje">Mensaje de Notificación *</label>
                      <textarea id="notif-mensaje" rows={2} placeholder="Escribe el aviso..." value={notificacionMensaje} onChange={(e) => setNotificacionMensaje(e.target.value)} required />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={crearNotificacionMutation.isPending}>
                        {crearNotificacionMutation.isPending ? 'Enviando...' : 'Enviar Notificación'}
                      </button>
                    </div>
                  </form>
                )}

                {/* LISTA ABAJO */}
                <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-md)', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  📋 Bandeja de Notificaciones ({notificacionesQuery.data?.length ?? 0})
                </h3>

                {notificacionesQuery.isLoading && (
                  <div className="loading-container"><span className="spinner" aria-hidden="true" /><span>Cargando notificaciones...</span></div>
                )}
                {notificacionesQuery.isError && (
                  <div className="alert alert-danger" role="alert">⚠️ Error al cargar las notificaciones.</div>
                )}
                {notificacionesQuery.data && notificacionesQuery.data.length === 0 && !notificacionesQuery.isLoading && (
                  <div className="empty-state">
                    <span className="empty-icon">🔔</span>
                    <h3>No hay notificaciones en la bandeja</h3>
                    <p className="text-muted">Los avisos enviados aparecerán listados aquí.</p>
                  </div>
                )}
                {notificacionesQuery.data && notificacionesQuery.data.length > 0 && (
                  <div className="notifications-list">
                    {pagNotificaciones.datosPagina.map((n) => (
                      <div key={n.id} className={`notification-item ${n.leido ? 'read' : 'unread'}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="notification-content">
                          <p className="notification-message">{n.mensaje}</p>
                          <span className="notification-date text-muted text-xs">{new Date(n.fechaEnvio).toLocaleString('es-CL')}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span className={`badge ${n.leido ? 'badge-fuera-de-servicio' : 'badge-disponible'}`}>
                            {n.leido ? 'Leída' : 'Nueva'}
                          </span>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminarNotificacion(n.id)}
                            disabled={eliminarNotificacionMutation.isPending}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {notificacionesQuery.data && notificacionesQuery.data.length > 0 && (
                  <PaginacionControls {...pagNotificaciones} etiqueta="Notificaciones" />
                )}
              </section>
            )}

            {/* 11. TRABAJADORES (Admin Only) */}
            {tabActiva === 'trabajadores' && (
              <section id="panel-trabajadores" role="tabpanel" aria-labelledby="tab-trabajadores">
                <div className="section-title-bar">
                  <div>
                    <h2>👷 Personal Operativo</h2>
                    <span className="text-muted text-sm">Asigna cargos arriba y consulta al equipo abajo</span>
                  </div>
                </div>

                {!esAdmin ? (
                  <div className="alert alert-info" role="alert">
                    ℹ️ El módulo de trabajadores está reservado para cuentas con rol de Administrador.
                  </div>
                ) : (
                  <>
                    {/* CREAR ARRIBA */}
                    <form onSubmit={handleCrearTrabajador} className="form-card" style={{ marginBottom: '1.75rem', maxWidth: '100%' }}>
                      <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                        ➕ Asignar Rol de Trabajador
                      </h3>
                      {errorTrabajador && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{errorTrabajador}</div>}
                      {exitoTrabajador && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{exitoTrabajador}</div>}
                      <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                        <div className="form-group">
                          <label htmlFor="trab-usuario">Usuario *</label>
                          <select id="trab-usuario" value={trabajadorUsuarioId || (usuariosQuery.data?.[0]?.id ?? 0)} onChange={(e) => setTrabajadorUsuarioId(Number(e.target.value))}>
                            {usuariosQuery.data?.map((u) => (
                              <option key={u.id} value={u.id}>{u.nombre} ({u.email}) [{u.rol}]</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="trab-cargo">Cargo Asignado *</label>
                          <input id="trab-cargo" type="text" placeholder="Ej. Supervisor de Canchas" value={trabajadorCargo} onChange={(e) => setTrabajadorCargo(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="trab-turno">Turno Laboral *</label>
                          <select id="trab-turno" value={trabajadorTurno} onChange={(e) => setTrabajadorTurno(e.target.value)}>
                            <option value="Mañana">Mañana (08:00 - 16:00)</option>
                            <option value="Tarde">Tarde (16:00 - 00:00)</option>
                            <option value="Noche">Noche (00:00 - 08:00)</option>
                            <option value="Rotativo">Turno Rotativo</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary btn-sm" disabled={crearTrabajadorMutation.isPending}>
                          {crearTrabajadorMutation.isPending ? 'Guardando...' : 'Asignar Trabajador'}
                        </button>
                      </div>
                    </form>

                    {/* LISTA ABAJO */}
                    <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-md)', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                      📋 Equipo de Trabajadores Registrados ({trabajadoresQuery.data?.length ?? 0})
                    </h3>

                    {trabajadoresQuery.isLoading && (
                      <div className="loading-container"><span className="spinner" aria-hidden="true" /><span>Cargando personal...</span></div>
                    )}
                    {trabajadoresQuery.isError && (
                      <div className="alert alert-danger" role="alert">⚠️ Error al cargar el listado de personal operativo.</div>
                    )}
                    {trabajadoresQuery.data && trabajadoresQuery.data.length === 0 && !trabajadoresQuery.isLoading && (
                      <div className="empty-state">
                        <span className="empty-icon">👷</span>
                        <h3>No hay personal registrado</h3>
                        <p className="text-muted">Asigna cargos a los usuarios registrados arriba.</p>
                      </div>
                    )}
                    {trabajadoresQuery.data && trabajadoresQuery.data.length > 0 && (
                      <div className="table-responsive">
                        <table className="data-table" aria-label="Tabla de Trabajadores">
                          <thead>
                            <tr>
                              <th scope="col">ID</th>
                              <th scope="col">Nombre</th>
                              <th scope="col">Email</th>
                              <th scope="col">Cargo</th>
                              <th scope="col">Turno</th>
                              <th scope="col">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagTrabajadores.datosPagina.map((t) => {
                              const nombreMostrar = t.usuarioNombre || t.nombre || `Personal #${t.id}`;
                              const emailMostrar = t.usuarioEmail || t.email || '—';
                              return (
                                <tr key={t.id}>
                                  <td className="font-mono text-muted">#{t.id}</td>
                                  <td className="font-bold">{nombreMostrar}</td>
                                  <td>{emailMostrar}</td>
                                  <td><span className="badge badge-trabajador">{t.cargo}</span></td>
                                  <td>{t.turno}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleEliminarTrabajador(t.id, nombreMostrar)}
                                      disabled={eliminarTrabajadorMutation.isPending}
                                    >
                                      Remover
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <PaginacionControls {...pagTrabajadores} etiqueta="Trabajadores" />
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            {/* 12. USUARIOS (Admin Only) */}
            {tabActiva === 'usuarios' && (
              <section id="panel-usuarios" role="tabpanel" aria-labelledby="tab-usuarios">
                <div className="section-title-bar">
                  <div>
                    <h2>👥 Directorio de Usuarios</h2>
                    <span className="text-muted text-sm">Registra una nueva cuenta arriba y consulta el directorio abajo</span>
                  </div>
                </div>

                {!esAdmin ? (
                  <div className="alert alert-info" role="alert">
                    ℹ️ El directorio de usuarios está reservado para cuentas con rol de Administrador.
                  </div>
                ) : (
                  <>
                    {/* CREAR ARRIBA */}
                    <form onSubmit={handleCrearUsuario} className="form-card" style={{ marginBottom: '1.75rem', maxWidth: '100%' }}>
                      <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                        ➕ Registrar Nuevo Usuario
                      </h3>
                      {errorUsuario && <div className="alert alert-danger" role="alert" style={{ marginBottom: '1rem' }}>{errorUsuario}</div>}
                      {exitoUsuario && <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>{exitoUsuario}</div>}
                      <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                        <div className="form-group">
                          <label htmlFor="usr-nombre">Nombre Completo *</label>
                          <input id="usr-nombre" type="text" placeholder="Ej. Juan Pérez" value={usuarioNombre} onChange={(e) => setUsuarioNombre(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="usr-email">Correo Electrónico *</label>
                          <input id="usr-email" type="email" placeholder="usuario@canchas.cl" value={usuarioEmail} onChange={(e) => setUsuarioEmail(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="usr-password">Contraseña (Mínimo 8 car.) *</label>
                          <input id="usr-password" type="password" placeholder="••••••••" value={usuarioPassword} onChange={(e) => setUsuarioPassword(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="usr-rol">Rol en el Sistema *</label>
                          <select id="usr-rol" value={usuarioRol} onChange={(e) => setUsuarioRol(e.target.value)}>
                            <option value="Cliente">Cliente</option>
                            <option value="Trabajador">Trabajador</option>
                            <option value="Administrador">Administrador</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary btn-sm" disabled={crearUsuarioMutation.isPending}>
                          {crearUsuarioMutation.isPending ? 'Guardando...' : 'Crear Usuario'}
                        </button>
                      </div>
                    </form>

                    {/* LISTA ABAJO */}
                    <h3 style={{ marginBottom: '1rem', fontSize: 'var(--font-size-md)', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                      📋 Directorio de Usuarios Registrados ({usuariosQuery.data?.length ?? 0})
                    </h3>

                    {usuariosQuery.isLoading && (
                      <div className="loading-container"><span className="spinner" aria-hidden="true" /><span>Cargando usuarios...</span></div>
                    )}
                    {usuariosQuery.isError && (
                      <div className="alert alert-danger" role="alert">⚠️ Error al cargar el directorio de usuarios.</div>
                    )}
                    {usuariosQuery.data && usuariosQuery.data.length === 0 && !usuariosQuery.isLoading && (
                      <div className="empty-state">
                        <span className="empty-icon">👥</span>
                        <h3>No hay usuarios registrados</h3>
                        <p className="text-muted">Crea una cuenta en el formulario de arriba.</p>
                      </div>
                    )}
                    {usuariosQuery.data && usuariosQuery.data.length > 0 && (
                      <div className="table-responsive">
                        <table className="data-table" aria-label="Tabla de Usuarios">
                          <thead>
                            <tr>
                              <th scope="col">ID</th>
                              <th scope="col">Nombre</th>
                              <th scope="col">Email</th>
                              <th scope="col">Rol</th>
                              <th scope="col">Registro</th>
                              <th scope="col">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagUsuarios.datosPagina.map((u) => (
                              <tr key={u.id}>
                                <td className="font-mono text-muted">#{u.id}</td>
                                <td className="font-bold">{u.nombre}</td>
                                <td>{u.email}</td>
                                <td><span className={`badge badge-${u.rol.toLowerCase()}`}>{u.rol}</span></td>
                                <td>{new Date(u.fechaCreacion).toLocaleDateString('es-CL')}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleEliminarUsuario(u.id, u.nombre)}
                                    disabled={eliminarUsuarioMutation.isPending}
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <PaginacionControls {...pagUsuarios} etiqueta="Usuarios" />
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModulosHubPage;
