'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth.store'
import { api, guardarFicha } from '@/lib/api'

const ESTADO_LABEL: Record<string, { label: string; color: string }> = {
  EN_ATENCION: { label: 'En atención', color: '#D4A84B' },
  CHECK_IN:    { label: 'En sala',     color: '#9B8FD4' },
  CONFIRMADA:  { label: 'Confirmado',  color: '#6B9FD4' },
  CREADA:      { label: 'Agendado',    color: '#8B92A5' },
  FINALIZADA:  { label: 'Finalizado',  color: '#5EA87A' },
  NO_SHOW:     { label: 'No asistió',  color: '#C46A6A' },
}

const BG = '#0F1117'; const SURFACE = '#161B22'; const CARD = '#1C2128'
const BORDER = '#30363D'; const TEXT1 = '#E6EDF3'; const TEXT2 = '#8B949E'; const TEXT3 = '#484F58'
const GREEN = '#1D9E75'

type Paciente = {
  id: string; nombre: string; motivo: string; hora: string; estado: string
  rut: string; edad: number | null; prevision: string; antecedentes: string[]; llegada: number | null; duracion: number
}

export default function MedicoPage() {
  const { usuario, logout } = useAuthStore()
  const router = useRouter()
  const [cola, setCola] = useState<Paciente[]>([])
  const [timer, setTimer] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [notas, setNotas] = useState({ diagnostico: '', indicaciones: '', proximo: '' })
  const [cargando, setCargando] = useState(true)
  const [vistaMovil, setVistaMovil] = useState<'paciente' | 'cola'>('paciente')
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (!localStorage.getItem('access_token')) router.push('/login')
  }, [mounted, router])

  useEffect(() => {
    if (!mounted) return
    const cargarCitas = async () => {
      try {
        setCargando(true)
        const data = await api.citas.delDia()
        setCola(data.map((c: any) => ({
          id: c.id, nombre: `${c.paciente.nombre} ${c.paciente.apellido}`,
          motivo: c.motivo ?? 'Sin motivo',
          hora: new Date(c.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          estado: c.estado, rut: c.paciente.rut, edad: null,
          prevision: c.paciente.prevision ?? '—', antecedentes: [], llegada: null, duracion: c.duracion,
        })))
      } catch (e) { console.error(e) }
      finally { setCargando(false) }
    }
    cargarCitas()
  }, [mounted])

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  const pacienteActual = cola.find(p => p.estado === 'EN_ATENCION') || null
  const siguiente = cola.find(p => p.estado === 'CHECK_IN') || null
  const siguientes = cola.filter(p => p.estado !== 'EN_ATENCION' && p.estado !== 'FINALIZADA' && p.estado !== 'NO_SHOW')
  const finalizados = cola.filter(p => p.estado === 'FINALIZADA' || p.estado === 'NO_SHOW')

  const finalizarConsulta = async () => {
    if (!pacienteActual) return
    try {
      await guardarFicha(pacienteActual.id, { diagnostico: notas.diagnostico, indicaciones: notas.indicaciones, proximo_control: notas.proximo })
      await api.citas.updateEstado(pacienteActual.id, 'FINALIZADA')
      setCola(prev => {
        const updated = prev.map(p => p.id === pacienteActual.id ? { ...p, estado: 'FINALIZADA' } : p)
        const next = updated.find(p => p.estado === 'CHECK_IN')
        return next ? updated.map(p => p.id === next.id ? { ...p, estado: 'EN_ATENCION' } : p) : updated
      })
      setTimer(0); setNotas({ diagnostico: '', indicaciones: '', proximo: '' })
    } catch (e) { console.error(e) }
  }

  const noAsistio = async () => {
    if (!pacienteActual) return
    try {
      await api.citas.updateEstado(pacienteActual.id, 'NO_SHOW')
      setCola(prev => {
        const updated = prev.map(p => p.id === pacienteActual.id ? { ...p, estado: 'NO_SHOW' } : p)
        const next = updated.find(p => p.estado === 'CHECK_IN')
        return next ? updated.map(p => p.id === next.id ? { ...p, estado: 'EN_ATENCION' } : p) : updated
      })
      setTimer(0); setNotas({ diagnostico: '', indicaciones: '', proximo: '' })
    } catch (e) { console.error(e) }
  }

  const minutos = Math.floor(timer / 60)
  const segundos = timer % 60
  const timerStr = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
  const duracionSecs = (pacienteActual?.duracion || 30) * 60
  const progreso = Math.min((timer / duracionSecs) * 100, 100)
  const timerColor = progreso >= 100 ? '#C46A6A' : progreso > 80 ? '#D4A84B' : '#5EA87A'

  const ColaSidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ color: TEXT2, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Cola del día · {cola.length} pacientes</div>
      {siguiente && (
        <div style={{ borderRadius: 10, padding: '12px 14px', background: '#9B8FD415', border: '1px solid #9B8FD440' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9B8FD4', textTransform: 'uppercase' }}>→ Siguiente</span>
            <span style={{ color: TEXT2, fontSize: 13 }}>{siguiente.hora}</span>
          </div>
          <div style={{ color: TEXT1, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{siguiente.nombre}</div>
          <div style={{ color: TEXT2, fontSize: 13 }}>{siguiente.motivo}</div>
        </div>
      )}
      {siguientes.filter(p => p.id !== siguiente?.id).map(p => {
        const est = ESTADO_LABEL[p.estado] ?? { color: TEXT1, label: p.estado }
        return (
          <div key={p.id} style={{ background: CARD, borderRadius: 10, padding: '12px 14px', border: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: est.color }}>{est.label}</span>
              <span style={{ color: TEXT2, fontSize: 13 }}>{p.hora}</span>
            </div>
            <div style={{ color: TEXT1, fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.nombre}</div>
            <div style={{ color: TEXT2, fontSize: 13 }}>{p.motivo}</div>
          </div>
        )
      })}
      {finalizados.length > 0 && <>
        <div style={{ color: TEXT3, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8 }}>Completadas</div>
        {finalizados.map(p => (
          <div key={p.id} style={{ borderRadius: 10, padding: '10px 14px', border: `1px solid ${BORDER}`, opacity: 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: p.estado === 'NO_SHOW' ? '#C46A6A' : '#5EA87A', fontWeight: 700 }}>{p.estado === 'NO_SHOW' ? '✗' : '✓'}</span>
              <span style={{ color: TEXT3, fontSize: 13 }}>{p.hora}</span>
            </div>
            <div style={{ color: TEXT2, fontSize: 13 }}>{p.nombre}</div>
          </div>
        ))}
      </>}
      {cola.length === 0 && !cargando && <div style={{ color: TEXT3, fontSize: 13, textAlign: 'center', paddingTop: 24 }}>Sin citas para hoy</div>}
    </div>
  )

  const PanelPaciente = () => (
    pacienteActual ? (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header paciente */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: '#D4A84B22', color: '#D4A84B', padding: '3px 10px', borderRadius: 6, display: 'inline-block', marginBottom: 8 }}>EN ATENCIÓN</span>
              <h1 style={{ color: TEXT1, fontSize: 24, fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1.2 }}>{pacienteActual.nombre}</h1>
              <p style={{ color: TEXT2, fontSize: 15, margin: 0 }}>{pacienteActual.motivo}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: timerColor, lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>{timerStr}</div>
              <div style={{ color: TEXT3, fontSize: 11, marginBottom: 6 }}>de {pacienteActual.duracion} min</div>
              <div style={{ width: 80, height: 3, background: BORDER, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progreso}%`, background: timerColor, borderRadius: 2, transition: 'width 1s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, flexShrink: 0 }}>
          {[
            { label: 'RUT', value: pacienteActual.rut },
            { label: 'Previsión', value: pacienteActual.prevision },
            { label: 'Hora cita', value: pacienteActual.hora },
            { label: 'Duración', value: `${pacienteActual.duracion} min` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: CARD, borderRadius: 8, padding: '10px 12px', border: `1px solid ${BORDER}` }}>
              <div style={{ color: TEXT3, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
              <div style={{ color: TEXT1, fontWeight: 600, fontSize: 14 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Notas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          <div style={{ background: CARD, borderRadius: 10, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ color: TEXT3, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Notas de consulta</div>
            </div>
            {[
              { key: 'diagnostico', label: 'Diagnóstico', placeholder: 'Ej: Gonartrosis grado II rodilla derecha...' },
              { key: 'indicaciones', label: 'Indicaciones', placeholder: 'Ej: Reposo relativo, ibuprofeno 400mg cada 8h...' },
              { key: 'proximo', label: 'Próximo control', placeholder: 'Ej: Control en 3 semanas con Rx...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ color: TEXT3, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
                <textarea
                  value={notas[key as keyof typeof notas]}
                  onChange={e => setNotas(n => ({ ...n, [key]: e.target.value }))}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: TEXT1, fontSize: 14, resize: 'none', outline: 'none', lineHeight: 1.6, fontFamily: 'inherit', boxSizing: 'border-box' }}
                  rows={2}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${BORDER}`, background: SURFACE, display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={finalizarConsulta} style={{ flex: 1, background: GREEN, color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
            ✓ Finalizar consulta
          </button>
          <button onClick={noAsistio} style={{ padding: '14px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1px solid #C46A6A40', background: '#C46A6A10', color: '#C46A6A', cursor: 'pointer' }}>
            No asistió
          </button>
        </div>
      </div>
    ) : (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✓</div>
        <h2 style={{ color: TEXT1, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Sin pacientes en atención</h2>
        <p style={{ color: TEXT2, fontSize: 15 }}>Todos los pacientes del día han sido atendidos</p>
      </div>
    )
  )

  return (
    <div style={{ height: '100dvh', background: BG, display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @media (max-width: 640px) {
          .desktop-layout { display: none !important; }
          .mobile-layout { display: flex !important; }
          .nav-desktop-med { display: none !important; }
          .hamburger-med { display: flex !important; }
        }
        @media (min-width: 641px) {
          .desktop-layout { display: flex !important; }
          .mobile-layout { display: none !important; }
          .nav-desktop-med { display: flex !important; }
          .hamburger-med { display: none !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <header style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
        <div style={{ padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: 28, height: 28, background: GREEN, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>V</span>
              </div>
              <span style={{ color: TEXT1, fontWeight: 600, fontSize: 14 }}>Vorticci Med</span>
            </button>
            <div style={{ width: 1, height: 14, background: BORDER }} />
            <span style={{ color: TEXT2, fontSize: 13 }}>{usuario ? `Dr. ${usuario.nombre}` : 'Médico'}</span>
          </div>

          <div className="nav-desktop-med" style={{ alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN }} />
              <span style={{ color: GREEN, fontSize: 13 }}>En atención · Box 3</span>
            </div>
            <span style={{ color: TEXT3, fontSize: 13 }}>{new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <button onClick={() => { logout(); router.push('/login') }} style={{ background: 'none', border: 'none', color: TEXT3, fontSize: 13, cursor: 'pointer' }}>Salir</button>
          </div>

          <button className="hamburger-med" onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5, display: 'none' }}>
            <div style={{ width: 20, height: 2, background: TEXT1, borderRadius: 2, transition: 'all 0.2s', transform: menuAbierto ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <div style={{ width: 20, height: 2, background: TEXT1, borderRadius: 2, opacity: menuAbierto ? 0 : 1 }} />
            <div style={{ width: 20, height: 2, background: TEXT1, borderRadius: 2, transition: 'all 0.2s', transform: menuAbierto ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
        </div>

        {menuAbierto && (
          <div style={{ background: SURFACE, borderTop: `1px solid ${BORDER}`, padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ color: GREEN, fontSize: 13, fontWeight: 600 }}>En atención · Box 3</div>
            <button onClick={() => { logout(); router.push('/login') }} style={{ background: 'rgba(196,106,106,0.1)', border: '1px solid rgba(196,106,106,0.3)', color: '#C46A6A', borderRadius: 8, padding: '10px', fontSize: 14, cursor: 'pointer' }}>Cerrar sesión</button>
          </div>
        )}
      </header>

      {/* MOBILE — tabs Paciente / Cola */}
      <div className="mobile-layout" style={{ display: 'none', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, display: 'flex', flexShrink: 0 }}>
          {[
            { id: 'paciente', label: pacienteActual ? `${pacienteActual.nombre.split(' ')[0]}` : 'Consulta' },
            { id: 'cola', label: `Cola · ${cola.length}` },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setVistaMovil(id as any)} style={{ flex: 1, background: 'none', border: 'none', padding: '13px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: vistaMovil === id ? TEXT1 : TEXT2, borderBottom: vistaMovil === id ? `2px solid ${GREEN}` : '2px solid transparent' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {vistaMovil === 'paciente'
            ? <PanelPaciente />
            : <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}><ColaSidebar /></div>
          }
        </div>
      </div>

      {/* DESKTOP — dos columnas */}
      <div className="desktop-layout" style={{ display: 'none', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PanelPaciente />
        </div>
        <div style={{ width: 280, borderLeft: `1px solid ${BORDER}`, background: SURFACE, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ color: TEXT3, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Cola del día</div>
            <div style={{ color: TEXT1, fontSize: 20, fontWeight: 700 }}>{cola.length} pacientes</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            <ColaSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
