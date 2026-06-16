'use client'
import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'

type Paciente = {
  id: string; rut: string; nombre: string; apellido: string; telefono: string; prevision: string
}
type Props = {
  onClose: () => void; onCreada: () => void; centroId: string; profesionalId: string
}

const STEPS = ['Paciente', 'Fecha y hora', 'Confirmar']

const BG     = '#161B22'
const CARD   = '#1C2128'
const BORDER = '#30363D'
const TEXT1  = '#E6EDF3'
const TEXT2  = '#8B949E'
const GREEN  = '#1D9E75'

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0D1117', border: `1px solid ${BORDER}`,
  borderRadius: 8, padding: '10px 14px', color: TEXT1, fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: TEXT2, marginBottom: 6,
}

export default function ModalAgendarCita({ onClose, onCreada, centroId, profesionalId }: Props) {
  const [step, setStep] = useState(0)
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<Paciente[]>([])
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [creandoPaciente, setCreandoPaciente] = useState(false)
  const [nuevoPaciente, setNuevoPaciente] = useState({ rut: '', nombre: '', apellido: '', fecha_nacimiento: '', telefono: '', prevision: '' })
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [motivo, setMotivo] = useState('')
  const [duracion, setDuracion] = useState('30')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (query.length < 2) { setResultados([]); return }
    clearTimeout(searchRef.current)
    searchRef.current = setTimeout(async () => {
      try { setResultados(await api.pacientes.buscar(query)) }
      catch { setResultados([]) }
    }, 300)
  }, [query])

  const handleCrearPaciente = async () => {
    setLoading(true); setError('')
    try {
      const p = await api.pacientes.crear(nuevoPaciente)
      setPacienteSeleccionado(p); setCreandoPaciente(false); setStep(1)
    } catch { setError('Error creando paciente. Verifica los datos.') }
    finally { setLoading(false) }
  }

  const handleConfirmar = async () => {
    if (!pacienteSeleccionado) return
    setLoading(true); setError('')
    try {
      await api.citas.crear({
        centro_id: centroId, paciente_id: pacienteSeleccionado.id,
        profesional_id: profesionalId,
        fecha_hora: new Date(`${fecha}T${hora}:00`).toISOString(),
        duracion: parseInt(duracion), motivo,
      })
      onCreada(); onClose()
    } catch { setError('Error creando la cita. Intenta de nuevo.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 14, width: '100%', maxWidth: 540, padding: 32, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: TEXT1, margin: 0 }}>Nueva cita</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: TEXT2, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: 3, borderRadius: 2, marginBottom: 8, background: i <= step ? GREEN : BORDER, transition: 'background 0.2s' }} />
              <span style={{ fontSize: 13, color: i <= step ? GREEN : TEXT2, fontWeight: 600 }}>{s}</span>
            </div>
          ))}
        </div>

        {/* STEP 0 — Buscar paciente */}
        {step === 0 && !creandoPaciente && (
          <div>
            <label style={labelStyle}>Buscar paciente</label>
            <input style={inputStyle} placeholder="Nombre o RUT..." value={query} onChange={e => setQuery(e.target.value)} autoFocus />

            {resultados.length > 0 && (
              <div style={{ marginTop: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
                {resultados.map(p => (
                  <button key={p.id} onClick={() => { setPacienteSeleccionado(p); setStep(1) }}
                    style={{ width: '100%', background: 'none', border: 'none', borderBottom: `1px solid ${BORDER}`, padding: '12px 16px', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#21262D')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{ color: TEXT1, fontSize: 15, fontWeight: 600 }}>{p.nombre} {p.apellido}</div>
                    <div style={{ color: TEXT2, fontSize: 13, marginTop: 2 }}>{p.rut} · {p.prevision}</div>
                  </button>
                ))}
              </div>
            )}

            {query.length >= 2 && resultados.length === 0 && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <p style={{ color: TEXT2, fontSize: 14, marginBottom: 12 }}>No se encontró ningún paciente</p>
                <button onClick={() => { setCreandoPaciente(true); setNuevoPaciente(p => ({ ...p, rut: query })) }}
                  style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  + Crear nuevo paciente
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 0 — Crear paciente */}
        {step === 0 && creandoPaciente && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Nombre</label><input style={inputStyle} placeholder="Carmen" value={nuevoPaciente.nombre} onChange={e => setNuevoPaciente(p => ({ ...p, nombre: e.target.value }))} /></div>
              <div><label style={labelStyle}>Apellido</label><input style={inputStyle} placeholder="Silva" value={nuevoPaciente.apellido} onChange={e => setNuevoPaciente(p => ({ ...p, apellido: e.target.value }))} /></div>
            </div>
            <div><label style={labelStyle}>RUT</label><input style={inputStyle} placeholder="15.666.777-8" value={nuevoPaciente.rut} onChange={e => setNuevoPaciente(p => ({ ...p, rut: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Fecha nacimiento</label><input style={inputStyle} type="date" value={nuevoPaciente.fecha_nacimiento} onChange={e => setNuevoPaciente(p => ({ ...p, fecha_nacimiento: e.target.value }))} /></div>
              <div><label style={labelStyle}>Teléfono</label><input style={inputStyle} placeholder="+56912345678" value={nuevoPaciente.telefono} onChange={e => setNuevoPaciente(p => ({ ...p, telefono: e.target.value }))} /></div>
            </div>
            <div>
              <label style={labelStyle}>Previsión</label>
              <select style={inputStyle} value={nuevoPaciente.prevision} onChange={e => setNuevoPaciente(p => ({ ...p, prevision: e.target.value }))}>
                <option value="">Seleccionar...</option>
                {['FONASA A','FONASA B','FONASA C','FONASA D','Isapre Cruz Blanca','Isapre Banmédica','Isapre Colmena','Isapre Consalud','Particular'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            {error && <p style={{ color: '#C46A6A', fontSize: 13 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCreandoPaciente(false)} style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, color: TEXT1, borderRadius: 8, padding: 12, fontSize: 14, cursor: 'pointer' }}>Volver</button>
              <button onClick={handleCrearPaciente} disabled={loading} style={{ flex: 2, background: GREEN, border: 'none', color: '#fff', borderRadius: 8, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Creando...' : 'Crear paciente →'}</button>
            </div>
          </div>
        )}

        {/* STEP 1 — Fecha y hora */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pacienteSeleccionado && (
              <div style={{ background: '#0D2218', border: `1px solid ${GREEN}40`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ color: GREEN, fontSize: 12, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Paciente</div>
                <div style={{ color: TEXT1, fontSize: 16, fontWeight: 600 }}>{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</div>
                <div style={{ color: TEXT2, fontSize: 13, marginTop: 2 }}>{pacienteSeleccionado.rut}</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Fecha</label><input style={inputStyle} type="date" value={fecha} onChange={e => setFecha(e.target.value)} min={new Date().toISOString().split('T')[0]} /></div>
              <div><label style={labelStyle}>Hora</label><input style={inputStyle} type="time" value={hora} onChange={e => setHora(e.target.value)} step="900" /></div>
            </div>
            <div><label style={labelStyle}>Motivo de consulta</label><input style={inputStyle} placeholder="Ej: Control post-operatorio..." value={motivo} onChange={e => setMotivo(e.target.value)} /></div>
            <div>
              <label style={labelStyle}>Duración</label>
              <select style={inputStyle} value={duracion} onChange={e => setDuracion(e.target.value)}>
                {['15','30','45','60'].map(d => <option key={d} value={d}>{d} minutos</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, color: TEXT1, borderRadius: 8, padding: 12, fontSize: 14, cursor: 'pointer' }}>Volver</button>
              <button onClick={() => { if (fecha && hora) setStep(2) }} disabled={!fecha || !hora}
                style={{ flex: 2, background: fecha && hora ? GREEN : BORDER, border: 'none', color: '#fff', borderRadius: 8, padding: 12, fontSize: 14, fontWeight: 700, cursor: fecha && hora ? 'pointer' : 'not-allowed' }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Confirmar */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Paciente', value: `${pacienteSeleccionado?.nombre} ${pacienteSeleccionado?.apellido}` },
                  { label: 'RUT', value: pacienteSeleccionado?.rut ?? '' },
                  { label: 'Fecha', value: new Date(`${fecha}T${hora}`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) },
                  { label: 'Hora', value: hora },
                  { label: 'Motivo', value: motivo || '—' },
                  { label: 'Duración', value: `${duracion} min` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TEXT2, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 15, color: TEXT1, fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
            {error && <p style={{ color: '#C46A6A', fontSize: 13 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, color: TEXT1, borderRadius: 8, padding: 12, fontSize: 14, cursor: 'pointer' }}>Volver</button>
              <button onClick={handleConfirmar} disabled={loading}
                style={{ flex: 2, background: GREEN, border: 'none', color: '#fff', borderRadius: 8, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Agendando...' : '✓ Confirmar cita'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
