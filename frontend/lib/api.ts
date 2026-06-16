const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return json
}

export const api = {
  post: (path: string, body: any) =>
    apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),

  pacientes: {
    buscar: (q: string) =>
      apiFetch(`/pacientes/buscar?q=${encodeURIComponent(q)}`),
    crear: (data: any) =>
      apiFetch('/pacientes', { method: 'POST', body: JSON.stringify(data) }),
    listar: (page = 1) =>
      apiFetch(`/pacientes?page=${page}`),
    getById: (id: string) =>
      apiFetch(`/pacientes/${id}`),
    actualizar: (id: string, data: any) =>
      apiFetch(`/pacientes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  citas: {
    delDia: (fecha?: string) =>
      apiFetch(`/citas/dia${fecha ? `?fecha=${fecha}` : ''}`),
    updateEstado: (id: string, estado: string) =>
      apiFetch(`/citas/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      }),
    porPaciente: (pacienteId: string) =>
      apiFetch(`/citas/paciente/${pacienteId}`),
    crear: (data: any) =>
      apiFetch('/citas', { method: 'POST', body: JSON.stringify(data) }),
  },
}
// Fichas clínicas
export const getFicha = (citaId: string) =>
  api.get(`/fichas/cita/${citaId}`).then(r => r.data);

export const guardarFicha = (citaId: string, data: { diagnostico?: string; indicaciones?: string; proximo_control?: string }) =>
  api.post(`/fichas/cita/${citaId}`, data).then(r => r.data);
