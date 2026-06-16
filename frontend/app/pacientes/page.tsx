'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

type Paciente = { id: string; rut: string; nombre: string; apellido: string; telefono: string; prevision: string; email?: string; created_at: string }
type Cita = { id: string; fecha_hora: string; estado: string; motivo?: string; profesional: { especialidad: string; usuario: { nombre: string; apellido: string } } }
type PacienteDetalle = Paciente & { citas: Cita[] }

const ESTADO_COLOR: Record<string, string> = { CREADA: '#8B92A5', CONFIRMADA: '#6B9FD4', CHECK_IN: '#9B8FD4', EN_ATENCION: '#D4A84B', FINALIZADA: '#5EA87A', NO_SHOW: '#C46A6A' }
const ESTADO_LABEL: Record<string, string> = { CREADA: 'Agendado', CONFIRMADA: 'Confirmado', CHECK_IN: 'Check-in', EN_ATENCION: 'En atención', FINALIZADA: 'Finalizado', NO_SHOW: 'No asistió' }

const BG = '#0F1117'; const SURFACE = '#161B22'; const CARD = '#1C2128'
const BORDER = '#30363D'; const TEXT1 = '#E6EDF3'; const TEXT2 = '#8B949E'; const TEXT3 = '#484F58'
const GREEN = '#1D9E75'

const inputStyle: React.CSSProperties = { width: '100%', background: '#0D1117', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px', color: TEXT1, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const labelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TEXT3, marginBottom: 6, display: 'block' }

function formatFecha(f: string) { return new Date(f).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) }
function formatHora(f: string) { return new Date(f).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) }

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
  useEffect(() => { if (!mounted) return; if (!localStorage.getItem('access_token')) { router.push('/login'); return }; cargarPacientes() }, [mounted, page])
  useEffect(() => {
    if (!mounted) return
    const t = setTimeout(() => { if (query.length >= 2) buscarPacientes(); else if (query === '') cargarPacientes() }, 300)
    return () => clearTimeout(t)
  }, [query])

  const cargarPacientes = async () => {
    setCargando(true)
    try { const d = await api.pacientes.listar(page); setPacientes(d.pacientes); setTotal(d.total); setPages(d.pages) }
    catch (e) { console.error(e) } finally { setCargando(false) }
  }
  const buscarPacientes = async () => {
    setCargando(true)
    try { const d = await api.pacientes.buscar(query); setPacientes(d); setTotal(d.length); setPages(1) }
    catch (e) { console.error(e) } finally { setCargando(false) }
  }
  const abrirFicha = async (p: Paciente) => {
    try { const d = await api.pacientes.getById(p.id); setSeleccionado(d); setForm({ nombre: d.nombre, apellido: d.apellido, telefono: d.telefono, email: d.email, prevision: d.prevision }); setEditando(false) }
    catch (e) { console.error(e) }
  }
  const guardarCambios = async () => {
    if (!seleccionado) return; setGuardando(true)
    try { const u = await api.pacientes.actualizar(seleccionado.id, form); setSeleccionado({ ...seleccionado, ...u }); setPacientes(prev => prev.map(p => p.id === seleccionado.id ? { ...p, ...u } : p)); setEditando(false) }
    catch (e) { console.error(e) } finally { setGuardando(false) }
  }

  if (!mounted) return null

  const Navbar = () => (
    <header style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => seleccionado ? setSeleccionado(null) : router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
          {seleccionado ? (
            <span style={{ color: TEXT2, fontSize: 14 }}>← Volver</span>
          ) : (
            <>
              <div style={{ width: 28, height: 28, background: GREEN, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>V</span>
              </div>
              <span style={{ color: TEXT1, fontWeight: 600, fontSize: 14 }}>Vorticci Med</span>
            </>
          )}
        </button>
        {!seleccionado && <><div style={{ width: 1, height: 14, background: BORDER }} /><span style={{ color: TEXT2, fontSize: 13 }}>Pacientes</span></>}
        {seleccionado && <span style={{ color: TEXT1, fontWeight: 600, fontSize: 14 }}>{seleccionado.nombre} {seleccionado.apellido}</span>}
      </div>
      {!seleccionado && (
        <button onClick={() => router.push('/recepcion')} style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT2, borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>← Recepción</button>
      )}
      {seleccionado && !editando && (
        <button onClick={() => setEditando(true)} style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT1, borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>Editar</button>
      )}
      {seleccionado && editando && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEditando(false)} style={{ background: 'none', border: `1px solid ${BORDER}`, color: TEXT2, borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={guardarCambios} disabled={guardando} style={{ background: GREEN, border: 'none', color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
        </div>
      )}
    </header>
  )

  return (
    <div style={{ minHeight: '100dvh', background: BG, color: TEXT1, fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 640px) {
          .desktop-two-col { display: none !important; }
          .mobile-single { display: flex !important; }
        }
        @media (min-width: 641px) {
          .desktop-two-col { display: flex !important; }
          .mobile-single { display: none !important; }
        }
      `}</style>

      <Navbar />

      {/* MOBILE — una columna, navega entre lista y ficha */}
      <div className="mobile-single" style={{ display: 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
        {!seleccionado ? (
          /* Lista */
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
              <div style={{ marginBottom: 12 }}>
                <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 2px 0' }}>Pacientes</h1>
                <p style={{ fontSize: 13, color: TEXT3, margin: 0 }}>{total} registrados</p>
              </div>
              <input placeholder="Buscar por nombre o RUT..." value={query} onChange={e => setQuery(e.target.value)}
                style={{ ...inputStyle, fontSize: 16 }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
              {cargando ? <div style={{ textAlign: 'center', padding: 40, color: TEXT3 }}>Cargando...</div>
                : pacientes.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: TEXT3 }}>Sin resultados</div>
                : pacientes.map(p => (
                  <div key={p.id} onClick={() => abrirFicha(p)} style={{ padding: '14px 16px', borderRadius: 10, cursor: 'pointer', background: CARD, border: `1px solid ${BORDER}`, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 3 }}>{p.nombre} {p.apellido}</div>
                        <div style={{ fontSize: 13, color: TEXT3 }}>{p.rut}</div>
                      </div>
                      <span style={{ fontSize: 11, background: `${BORDER}`, color: TEXT2, padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>{p.prevision ?? '—'}</span>
                    </div>
                    <div style={{ fontSize: 13, color: TEXT2, marginTop: 6 }}>{p.telefono}</div>
                  </div>
                ))}
            </div>
            {pages > 1 && !query && (
              <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: 'none', border: `1px solid ${BORDER}`, color: page === 1 ? TEXT3 : TEXT1, borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>← Ant</button>
                <span style={{ fontSize: 12, color: TEXT3 }}>{page} / {pages}</span>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{ background: 'none', border: `1px solid ${BORDER}`, color: page === pages ? TEXT3 : TEXT1, borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: page === pages ? 'not-allowed' : 'pointer' }}>Sig →</button>
              </div>
            )}
          </div>
        ) : (
          /* Ficha móvil */
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            <FichaPaciente seleccionado={seleccionado} editando={editando} form={form} setForm={setForm} guardando={guardando} />
          </div>
        )}
      </div>

      {/* DESKTOP — dos columnas */}
      <div className="desktop-two-col" style={{ display: 'none', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: seleccionado ? 380 : '100%', borderRight: seleccionado ? `1px solid ${BORDER}` : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '24px 24px 16px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            <div style={{ marginBottom: 16 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Pacientes</h1>
              <p style={{ fontSize: 13, color: TEXT3 }}>{total} registrados</p>
            </div>
            <input placeholder="Buscar por nombre o RUT..." value={query} onChange={e => setQuery(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {cargando ? <div style={{ textAlign: 'center', padding: 40, color: TEXT3 }}>Cargando...</div>
              : pacientes.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: TEXT3 }}>Sin resultados</div>
              : pacientes.map(p => (
                <div key={p.id} onClick={() => abrirFicha(p)} style={{ padding: '14px 16px', borderRadius: 10, cursor: 'pointer', background: seleccionado?.id === p.id ? `${GREEN}18` : CARD, border: `1px solid ${seleccionado?.id === p.id ? `${GREEN}40` : BORDER}`, marginBottom: 8, transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{p.nombre} {p.apellido}</div>
                      <div style={{ fontSize: 12, color: TEXT3 }}>{p.rut}</div>
                    </div>
                    <span style={{ fontSize: 11, background: BORDER, color: TEXT2, padding: '3px 8px', borderRadius: 6 }}>{p.prevision ?? '—'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: TEXT2, marginTop: 6 }}>{p.telefono}</div>
                </div>
              ))}
          </div>
          {pages > 1 && !query && (
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: 'none', border: `1px solid ${BORDER}`, color: page === 1 ? TEXT3 : TEXT1, borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>← Anterior</button>
              <span style={{ fontSize: 12, color: TEXT3 }}>Página {page} de {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{ background: 'none', border: `1px solid ${BORDER}`, color: page === pages ? TEXT3 : TEXT1, borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: page === pages ? 'not-allowed' : 'pointer' }}>Siguiente →</button>
            </div>
          )}
        </div>
        {seleccionado && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{seleccionado.nombre} {seleccionado.apellido}</h2>
                <p style={{ fontSize: 13, color: TEXT3 }}>RUT {seleccionado.rut} · Desde {formatFecha(seleccionado.created_at)}</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {!editando ? (
                  <>
                    <button onClick={() => setEditando(true)} style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT1, borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Editar</button>
                    <button onClick={() => setSeleccionado(null)} style={{ background: 'none', border: 'none', color: TEXT3, fontSize: 18, cursor: 'pointer' }}>✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditando(false)} style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT2, borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
                    <button onClick={guardarCambios} disabled={guardando} style={{ background: GREEN, border: 'none', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
                  </>
                )}
              </div>
            </div>
            <FichaPaciente seleccionado={seleccionado} editando={editando} form={form} setForm={setForm} guardando={guardando} />
          </div>
        )}
      </div>
    </div>
  )
}

function FichaPaciente({ seleccionado, editando, form, setForm, guardando }: { seleccionado: any; editando: boolean; form: any; setForm: any; guardando: boolean }) {
  const BORDER = '#30363D'; const CARD = '#1C2128'; const TEXT1 = '#E6EDF3'; const TEXT2 = '#8B949E'; const TEXT3 = '#484F58'
  const inputStyle: React.CSSProperties = { width: '100%', background: '#0D1117', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px', color: TEXT1, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TEXT3, marginBottom: 6, display: 'block' }
  const ESTADO_COLOR: Record<string, string> = { CREADA: '#8B92A5', CONFIRMADA: '#6B9FD4', CHECK_IN: '#9B8FD4', EN_ATENCION: '#D4A84B', FINALIZADA: '#5EA87A', NO_SHOW: '#C46A6A' }
  const ESTADO_LABEL: Record<string, string> = { CREADA: 'Agendado', CONFIRMADA: 'Confirmado', CHECK_IN: 'Check-in', EN_ATENCION: 'En atención', FINALIZADA: 'Finalizado', NO_SHOW: 'No asistió' }
  function formatFecha(f: string) { return new Date(f).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) }
  function formatHora(f: string) { return new Date(f).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ ...labelStyle, marginBottom: 14 }}>Datos personales</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {editando ? <>
            <div><label style={labelStyle}>Nombre</label><input style={inputStyle} value={form.nombre ?? ''} onChange={e => setForm((f: any) => ({ ...f, nombre: e.target.value }))} /></div>
            <div><label style={labelStyle}>Apellido</label><input style={inputStyle} value={form.apellido ?? ''} onChange={e => setForm((f: any) => ({ ...f, apellido: e.target.value }))} /></div>
            <div><label style={labelStyle}>Teléfono</label><input style={inputStyle} value={form.telefono ?? ''} onChange={e => setForm((f: any) => ({ ...f, telefono: e.target.value }))} /></div>
            <div><label style={labelStyle}>Email</label><input style={inputStyle} value={form.email ?? ''} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} /></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Previsión</label>
              <select style={inputStyle} value={form.prevision ?? ''} onChange={e => setForm((f: any) => ({ ...f, prevision: e.target.value }))}>
                <option value="">Seleccionar...</option>
                {['FONASA A','FONASA B','FONASA C','FONASA D','Isapre Cruz Blanca','Isapre Banmédica','Isapre Colmena','Isapre Consalud','Particular'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </> : <>
            {[{ label: 'RUT', value: seleccionado.rut }, { label: 'Teléfono', value: seleccionado.telefono }, { label: 'Email', value: seleccionado.email ?? '—' }, { label: 'Previsión', value: seleccionado.prevision ?? '—' }].map(({ label, value }) => (
              <div key={label}><div style={labelStyle}>{label}</div><div style={{ fontSize: 15, fontWeight: 500, color: TEXT1 }}>{value}</div></div>
            ))}
          </>}
        </div>
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ ...labelStyle, marginBottom: 14 }}>Historial de citas ({seleccionado.citas?.length ?? 0})</div>
        {!seleccionado.citas?.length
          ? <div style={{ textAlign: 'center', padding: '20px 0', color: TEXT3, fontSize: 14 }}>Sin citas registradas</div>
          : seleccionado.citas.map((c: any) => (
            <div key={c.id} style={{ background: '#0D1117', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2, color: TEXT1 }}>{c.motivo ?? 'Sin motivo'}</div>
                  <div style={{ fontSize: 12, color: TEXT3 }}>{c.profesional.usuario.nombre} · {c.profesional.especialidad}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: ESTADO_COLOR[c.estado] ?? TEXT1, marginBottom: 2 }}>{ESTADO_LABEL[c.estado] ?? c.estado}</div>
                  <div style={{ fontSize: 11, color: TEXT3 }}>{formatFecha(c.fecha_hora)}</div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
