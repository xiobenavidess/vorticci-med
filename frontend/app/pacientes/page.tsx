'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

type Paciente = {
  id: string
  rut: string
  nombre: string
  apellido: string
  telefono: string
  prevision: string
  email?: string
  created_at: string
}

type Cita = {
  id: string
  fecha_hora: string
  estado: string
  motivo?: string
  profesional: { especialidad: string; usuario: { nombre: string; apellido: string } }
}

type PacienteDetalle = Paciente & { citas: Cita[] }

const ESTADO_COLOR: Record<string, string> = {
  CREADA: '#D3D1C7', CONFIRMADA: '#85B7EB', CHECK_IN: '#AFA9EC',
  EN_ATENCION: '#FAC775', FINALIZADA: '#97C459', NO_SHOW: '#F09595',
}
const ESTADO_LABEL: Record<string, string> = {
  CREADA: 'Agendado', CONFIRMADA: 'Confirmado', CHECK_IN: 'Check-in',
  EN_ATENCION: 'En atención', FINALIZADA: 'Finalizado', NO_SHOW: 'No asistió',
}

function formatFecha(f: string) {
  return new Date(f).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatHora(f: string) {
  return new Date(f).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

const INPUT = `
  width: 100%; background: #1C2128; border: 1px solid #30363D;
  border-radius: 10px; padding: 10px 14px; color: #fff; font-size: 14px;
  outline: none; font-family: inherit;
`

export default function PacientesPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [query, setQuery] = useState('')
  const [cargando, setCargando] = useState(true)
  const [seleccionado, setSeleccionado] = useState<PacienteDetalle | null>(null)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState<Partial<Paciente>>({})
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    cargarPacientes()
  }, [mounted, page])

  useEffect(() => {
    if (!mounted) return
    const t = setTimeout(() => {
      if (query.length >= 2) buscarPacientes()
      else if (query === '') cargarPacientes()
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const cargarPacientes = async () => {
    setCargando(true)
    try {
      const data = await api.pacientes.listar(page)
      setPacientes(data.pacientes)
      setTotal(data.total)
      setPages(data.pages)
    } catch (e) { console.error(e) }
    finally { setCargando(false) }
  }

  const buscarPacientes = async () => {
    setCargando(true)
    try {
      const data = await api.pacientes.buscar(query)
      setPacientes(data)
      setTotal(data.length)
      setPages(1)
    } catch (e) { console.error(e) }
    finally { setCargando(false) }
  }

  const abrirFicha = async (p: Paciente) => {
    try {
      const data = await api.pacientes.getById(p.id)
      setSeleccionado(data)
      setForm({ nombre: data.nombre, apellido: data.apellido, telefono: data.telefono, email: data.email, prevision: data.prevision })
      setEditando(false)
    } catch (e) { console.error(e) }
  }

  const guardarCambios = async () => {
    if (!seleccionado) return
    setGuardando(true)
    try {
      const updated = await api.pacientes.actualizar(seleccionado.id, form)
      setSeleccionado({ ...seleccionado, ...updated })
      setPacientes(prev => prev.map(p => p.id === seleccionado.id ? { ...p, ...updated } : p))
      setEditando(false)
    } catch (e) { console.error(e) }
    finally { setGuardando(false) }
  }

  if (!mounted) return null

  const CARD = { background: '#161B22', border: '1px solid #30363D', borderRadius: 12 }
  const LABEL_S = { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#64748B', marginBottom: 6 }

  return (
    <div style={{ minHeight: '100vh', background: '#0F1117', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <header style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', borderBottom: '1px solid #30363D', background: '#161B22', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>V</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Vorticci Med</span>
          </button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Pacientes</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push('/recepcion')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #30363D', color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
            ← Recepción
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Columna izquierda — listado */}
        <div style={{ width: seleccionado ? 380 : '100%', borderRight: seleccionado ? '1px solid #30363D' : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.2s' }}>

          {/* Header listado */}
          <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Pacientes</h1>
                <p style={{ fontSize: 13, color: '#64748B' }}>{total} registrados</p>
              </div>
            </div>
            <input
              placeholder="Buscar por nombre o RUT..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: '100%', background: '#1C2128', border: '1px solid #30363D', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          {/* Lista */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {cargando ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Cargando...</div>
            ) : pacientes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Sin resultados</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pacientes.map(p => (
                  <div
                    key={p.id}
                    onClick={() => abrirFicha(p)}
                    style={{
                      padding: '14px 16px', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s',
                      background: seleccionado?.id === p.id ? 'rgba(29,158,117,0.12)' : 'rgba(255,255,255,0.03)',
                      border: seleccionado?.id === p.id ? '1px solid rgba(29,158,117,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{p.nombre} {p.apellido}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{p.rut}</div>
                      </div>
                      <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', padding: '3px 8px', borderRadius: 6 }}>{p.prevision ?? '—'}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>{p.telefono}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paginación */}
          {pages > 1 && !query && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ background: 'none', border: '1px solid #30363D', color: page === 1 ? '#333' : '#fff', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                ← Anterior
              </button>
              <span style={{ fontSize: 12, color: '#64748B' }}>Página {page} de {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                style={{ background: 'none', border: '1px solid #30363D', color: page === pages ? '#333' : '#fff', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: page === pages ? 'not-allowed' : 'pointer' }}>
                Siguiente →
              </button>
            </div>
          )}
        </div>

        {/* Columna derecha — ficha */}
        {seleccionado && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>

            {/* Header ficha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{seleccionado.nombre} {seleccionado.apellido}</h2>
                <p style={{ fontSize: 14, color: '#64748B' }}>RUT {seleccionado.rut} · Paciente desde {formatFecha(seleccionado.created_at)}</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {!editando ? (
                  <>
                    <button onClick={() => setEditando(true)}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #30363D', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
                      Editar
                    </button>
                    <button onClick={() => setSeleccionado(null)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer' }}>✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditando(false)}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #30363D', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
                      Cancelar
                    </button>
                    <button onClick={guardarCambios} disabled={guardando}
                      style={{ background: '#1D9E75', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: guardando ? 0.6 : 1 }}>
                      {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Datos del paciente */}
            <div style={{ ...CARD, padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', marginBottom: 16 }}>Datos personales</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {editando ? (
                  <>
                    <div>
                      <div style={LABEL_S}>Nombre</div>
                      <input style={{ ...Object.fromEntries(INPUT.split(';').filter(s => s.trim()).map(s => { const [k, v] = s.split(':'); return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v?.trim()] })) } as any}
                        value={form.nombre ?? ''} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </div>
                    <div>
                      <div style={LABEL_S}>Apellido</div>
                      <input style={{ width: '100%', background: '#1C2128', border: '1px solid #30363D', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                        value={form.apellido ?? ''} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} />
                    </div>
                    <div>
                      <div style={LABEL_S}>Teléfono</div>
                      <input style={{ width: '100%', background: '#1C2128', border: '1px solid #30363D', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                        value={form.telefono ?? ''} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                    </div>
                    <div>
                      <div style={LABEL_S}>Email</div>
                      <input style={{ width: '100%', background: '#1C2128', border: '1px solid #30363D', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                        value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={LABEL_S}>Previsión</div>
                      <select style={{ width: '100%', background: '#1C2128', border: '1px solid #30363D', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                        value={form.prevision ?? ''} onChange={e => setForm(f => ({ ...f, prevision: e.target.value }))}>
                        <option value="">Seleccionar...</option>
                        {['FONASA A','FONASA B','FONASA C','FONASA D','Isapre Cruz Blanca','Isapre Banmédica','Isapre Colmena','Isapre Consalud','Particular'].map(p => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      { label: 'RUT', value: seleccionado.rut },
                      { label: 'Teléfono', value: seleccionado.telefono },
                      { label: 'Email', value: seleccionado.email ?? '—' },
                      { label: 'Previsión', value: seleccionado.prevision ?? '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={LABEL_S}>{label}</div>
                        <div style={{ fontSize: 15, fontWeight: 500 }}>{value}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Historial de citas */}
            <div style={{ ...CARD, padding: '20px 24px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', marginBottom: 16 }}>
                Historial de citas ({seleccionado.citas?.length ?? 0})
              </div>
              {!seleccionado.citas?.length ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>Sin citas registradas</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {seleccionado.citas.map(c => {
                    const color = ESTADO_COLOR[c.estado] ?? '#fff'
                    return (
                      <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{c.motivo ?? 'Sin motivo'}</div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>
                            {c.profesional.usuario.nombre} {c.profesional.usuario.apellido} · {c.profesional.especialidad}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 3 }}>{ESTADO_LABEL[c.estado] ?? c.estado}</div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>{formatFecha(c.fecha_hora)} {formatHora(c.fecha_hora)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}