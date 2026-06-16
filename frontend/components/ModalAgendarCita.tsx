'use client'
import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'

type Paciente = {
  id: string
  rut: string
  nombre: string
  apellido: string
  telefono: string
  prevision: string
}

type Props = {
  onClose: () => void
  onCreada: () => void
  centroId: string
  profesionalId: string
}

const STEPS = ['Paciente', 'Fecha y hora', 'Confirmar']

export default function ModalAgendarCita({ onClose, onCreada, centroId, profesionalId }: Props) {
  const [step, setStep] = useState(0)

  // Step 1 — Buscar paciente
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<Paciente[]>([])
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [creandoPaciente, setCreandoPaciente] = useState(false)
  const [nuevoPaciente, setNuevoPaciente] = useState({ rut: '', nombre: '', apellido: '', fecha_nacimiento: '', telefono: '', prevision: '' })
  const searchRef = useRef<NodeJS.Timeout>()

  // Step 2 — Fecha y hora
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [motivo, setMotivo] = useState('')
  const [duracion, setDuracion] = useState('30')

  // General
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (query.length < 2) { setResultados([]); return }
    clearTimeout(searchRef.current)
    searchRef.current = setTimeout(async () => {
      try {
        const data = await api.pacientes.buscar(query)
        setResultados(data)
      } catch { setResultados([]) }
    }, 300)
  }, [query])

  const handleCrearPaciente = async () => {
    setLoading(true)
    setError('')
    try {
      const p = await api.pacientes.crear(nuevoPaciente)
      setPacienteSeleccionado(p)
      setCreandoPaciente(false)
      setStep(1)
    } catch (e: any) {
      setError('Error creando paciente. Verifica los datos.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmar = async () => {
    if (!pacienteSeleccionado) return
    setLoading(true)
    setError('')
    try {
      const fechaHora = new Date(`${fecha}T${hora}:00`).toISOString()
      await api.citas.crear({
        centro_id:      centroId,
        paciente_id:    pacienteSeleccionado.id,
        profesional_id: profesionalId,
        fecha_hora:     fechaHora,
        duracion:       parseInt(duracion),
        motivo,
      })
      onCreada()
      onClose()
    } catch (e: any) {
      setError('Error creando la cita. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const INPUT = "w-full bg-[#1E2330] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
  const LABEL = "block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#0D1410', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: '100%', maxWidth: 520, padding: 32 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Nueva cita</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: 3, borderRadius: 2, marginBottom: 6,
                background: i <= step ? '#1D9E75' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.2s',
              }} />
              <span style={{ fontSize: 11, color: i <= step ? '#1D9E75' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{s}</span>
            </div>
          ))}
        </div>

        {/* STEP 0 — Paciente */}
        {step === 0 && !creandoPaciente && (
          <div>
            <label className={LABEL}>Buscar paciente</label>
            <input
              className={INPUT}
              placeholder="Nombre o RUT..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />

            {resultados.length > 0 && (
              <div style={{ marginTop: 8, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                {resultados.map(p => (
                  <button key={p.id} onClick={() => { setPacienteSeleccionado(p); setStep(1) }}
                    style={{ width: '100%', background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{p.nombre} {p.apellido}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{p.rut} · {p.prevision}</div>
                  </button>
                ))}
              </div>
            )}

            {query.length >= 2 && resultados.length === 0 && (
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 12 }}>No se encontró ningún paciente</p>
                <button onClick={() => { setCreandoPaciente(true); setNuevoPaciente(p => ({ ...p, rut: query })) }}
                  style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
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
              <div>
                <label className={LABEL}>Nombre</label>
                <input className={INPUT} placeholder="Carmen" value={nuevoPaciente.nombre} onChange={e => setNuevoPaciente(p => ({ ...p, nombre: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Apellido</label>
                <input className={INPUT} placeholder="Silva" value={nuevoPaciente.apellido} onChange={e => setNuevoPaciente(p => ({ ...p, apellido: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={LABEL}>RUT</label>
              <input className={INPUT} placeholder="15.666.777-8" value={nuevoPaciente.rut} onChange={e => setNuevoPaciente(p => ({ ...p, rut: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className={LABEL}>Fecha nacimiento</label>
                <input className={INPUT} type="date" value={nuevoPaciente.fecha_nacimiento} onChange={e => setNuevoPaciente(p => ({ ...p, fecha_nacimiento: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Teléfono</label>
                <input className={INPUT} placeholder="+56912345678" value={nuevoPaciente.telefono} onChange={e => setNuevoPaciente(p => ({ ...p, telefono: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={LABEL}>Previsión</label>
              <select className={INPUT} value={nuevoPaciente.prevision} onChange={e => setNuevoPaciente(p => ({ ...p, prevision: e.target.value }))}>
                <option value="">Seleccionar...</option>
                <option>FONASA A</option>
                <option>FONASA B</option>
                <option>FONASA C</option>
                <option>FONASA D</option>
                <option>Isapre Cruz Blanca</option>
                <option>Isapre Banmédica</option>
                <option>Isapre Colmena</option>
                <option>Isapre Consalud</option>
                <option>Particular</option>
              </select>
            </div>
            {error && <p style={{ color: '#F09595', fontSize: 13 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setCreandoPaciente(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '12px', fontSize: 14, cursor: 'pointer' }}>
                Volver
              </button>
              <button onClick={handleCrearPaciente} disabled={loading} style={{ flex: 2, background: '#1D9E75', border: 'none', color: '#fff', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Creando...' : 'Crear paciente →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 1 — Fecha y hora */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pacienteSeleccionado && (
              <div style={{ background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ color: '#1D9E75', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Paciente seleccionado</div>
                <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{pacienteSeleccionado.rut}</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className={LABEL}>Fecha</label>
                <input className={INPUT} type="date" value={fecha} onChange={e => setFecha(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className={LABEL}>Hora</label>
                <input className={INPUT} type="time" value={hora} onChange={e => setHora(e.target.value)} step="900" />
              </div>
            </div>
            <div>
              <label className={LABEL}>Motivo de consulta</label>
              <input className={INPUT} placeholder="Ej: Control post-operatorio..." value={motivo} onChange={e => setMotivo(e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Duración</label>
              <select className={INPUT} value={duracion} onChange={e => setDuracion(e.target.value)}>
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setStep(0)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '12px', fontSize: 14, cursor: 'pointer' }}>
                Volver
              </button>
              <button onClick={() => { if (fecha && hora) setStep(2) }} disabled={!fecha || !hora}
                style={{ flex: 2, background: fecha && hora ? '#1D9E75' : 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: fecha && hora ? 'pointer' : 'not-allowed' }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Confirmar */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#161A18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
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
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
            {error && <p style={{ color: '#F09595', fontSize: 13 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '12px', fontSize: 14, cursor: 'pointer' }}>
                Volver
              </button>
              <button onClick={handleConfirmar} disabled={loading}
                style={{ flex: 2, background: '#1D9E75', border: 'none', color: '#fff', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Agendando...' : '✓ Confirmar cita'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}