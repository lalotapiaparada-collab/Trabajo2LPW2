import { http, HttpResponse } from 'msw';

// URL base de la API según configuración
const API_URL = 'https://localhost:7269';

// Token JWT ficticio válido para pruebas (contiene payload decodificable con rol)
// Payload base64: {"sub":"1","email":"trabajador@canchas.cl","http://schemas.microsoft.com/ws/2008/06/identity/claims/role":"Trabajador","exp":9999999999}
export const TOKEN_TRABAJADOR_MOCK =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0cmFiYWphZG9yQGNhbmNoYXMuY2wiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJUcmFiYWphZG9yIiwiZXhwIjo5OTk5OTk5OTk5fQ.signature';

// Payload base64: {"sub":"2","email":"cliente@canchas.cl","http://schemas.microsoft.com/ws/2008/06/identity/claims/role":"Cliente","exp":9999999999}
export const TOKEN_CLIENTE_MOCK =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZW1haWwiOiJjbGllbnRlQGNhbmNoYXMuY2wiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJDbGllbnRlIiwiZXhwIjo5OTk5OTk5OTk5fQ.signature';

export const canchasMock = [
  {
    id: 1,
    numero: 101,
    sedeId: 1,
    sedeNombre: 'Sede Central',
    tipoCanchaId: 1,
    tipoCanchaNombre: 'Cancha Sintética F7',
    precioPorHora: 25000,
    estado: 'Disponible',
  },
  {
    id: 2,
    numero: 102,
    sedeId: 1,
    sedeNombre: 'Sede Central',
    tipoCanchaId: 2,
    tipoCanchaNombre: 'Pádel Techado',
    precioPorHora: 18000,
    estado: 'Mantenimiento',
  },
];

export const sedesMock = [
  { id: 1, nombre: 'Sede Central', direccion: 'Av. Siempre Viva 123', telefono: '+56911111111' },
  { id: 2, nombre: 'Sede Norte', direccion: 'Calle Norte 456', telefono: null },
];

export const tiposCanchaMock = [
  { id: 1, nombre: 'Cancha Sintética F7', descripcion: 'Fútbol 7 profesional', precioPorHora: 25000 },
  { id: 2, nombre: 'Pádel Techado', descripcion: 'Cancha de pádel climatizada', precioPorHora: 18000 },
];

export const handlers = [
  // 1. Login
  http.post(`${API_URL}/api/v1/usuarios/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (body.email === 'trabajador@canchas.cl' && body.password === 'Password123!') {
      return HttpResponse.json({
        token: TOKEN_TRABAJADOR_MOCK,
        usuario: {
          id: 1,
          nombre: 'Trabajador Demo',
          email: 'trabajador@canchas.cl',
          rol: 'Trabajador',
          fechaCreacion: '2026-01-01T00:00:00Z',
        },
      });
    }

    if (body.email === 'error@canchas.cl') {
      return HttpResponse.json(
        { title: 'Credenciales inválidas', status: 401, detail: 'Correo o contraseña incorrectos' },
        { status: 401 }
      );
    }

    if (body.email === 'rate@canchas.cl') {
      return HttpResponse.json(
        { title: 'Límite excedido', status: 429, detail: 'Demasiadas solicitudes. Espera un minuto.' },
        { status: 429 }
      );
    }

    return HttpResponse.json(
      { title: 'No autorizado', status: 401, detail: 'Credenciales inválidas' },
      { status: 401 }
    );
  }),

  // 2. Sedes
  http.get(`${API_URL}/api/v1/sedes`, () => {
    return HttpResponse.json(sedesMock);
  }),

  // 3. Tipos de cancha
  http.get(`${API_URL}/api/v1/tipos-cancha`, () => {
    return HttpResponse.json(tiposCanchaMock);
  }),

  // 4. Canchas - Listado
  http.get(`${API_URL}/api/v1/canchas`, () => {
    return HttpResponse.json(canchasMock);
  }),

  // 5. Canchas - Detalle
  http.get(`${API_URL}/api/v1/canchas/:id`, ({ params }) => {
    const id = Number(params.id);
    const cancha = canchasMock.find((c) => c.id === id);
    if (!cancha) {
      return HttpResponse.json({ status: 404, title: 'No encontrado' }, { status: 404 });
    }
    return HttpResponse.json(cancha);
  }),

  // 6. Canchas - Crear
  http.post(`${API_URL}/api/v1/canchas`, async ({ request }) => {
    const body = (await request.json()) as { numero?: number };
    if (body.numero === 999) {
      return HttpResponse.json(
        {
          status: 400,
          title: 'Error de validación',
          errors: { Numero: ['El número 999 ya existe en esta sede'] },
        },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        id: 3,
        numero: body.numero || 103,
        sedeId: 1,
        sedeNombre: 'Sede Central',
        tipoCanchaId: 1,
        tipoCanchaNombre: 'Cancha Sintética F7',
        precioPorHora: 25000,
        estado: 'Disponible',
      },
      { status: 201 }
    );
  }),

  // 7. Canchas - Eliminar
  http.delete(`${API_URL}/api/v1/canchas/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
