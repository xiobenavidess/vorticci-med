'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth.store'
import { api } from '@/lib/api'

const BG      = '#0F1117'
const SURFACE = '#161B22'
const CARD    = '#1C2128'
const BORDER  = '#30363D'
const TEXT1   = '#E6EDF3'
const TEXT2   = '#8B949E'
const TEXT3   = '#484F58'
const GREEN   = '#1D9E75'

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMADA:  { label: 'Confirmado',  color: '#4ADE80', bg: 'rgba(74,222,128,0.15)' },
  CREADA:      { label: 'Agendado',    color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' },
  EN_ATENCION: { label: 'En atención', color: '#60A5FA', bg: 'rgba(96,165,250,0.15)' },
  FINALIZADA:  { label: 'Finalizada',  color: '#4ADE80', bg: 'rgba(74,222,128,0.15)' },
  NO_SHOW:     { label: 'No asistió',  color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
}

function formatFecha(f: string) {
  return new Date(f).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatCorta(f: string) {
  return new Date(f).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}
function formatHora(f: string) {
  return new Date(f).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

type Vista = 'inicio' | 'citas' | 'historial'

export default function PacientePage() {
  const { usuario, logout } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [vista, setVista] = useState<Vista>('inicio')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [citas, setCitas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (!localStorage.getItem('access_token')) { router.push('/login'); return }
    cargarDatos()
  }, [mounted])

  async function cargarDatos() {
    try {
      setCargando(true)
      if (!usuario?.id) return
      const citasRes = await api.citas.porPaciente(usuario.id)
      setCitas(citasRes ?? [])
    } catch (e) {
      console.error('Error cargando datos paciente:', e)
    } finally {
      setCargando(false)
    }
  }

  if (!mounted) return null

  const nombre = usuario?.nombre ?? 'Paciente'
  const hoy = new Date()
  const proximas = citas.filter(c => new Date(c.fecha_hora) >= hoy && c.estado !== 'FINALIZADA' && c.estado !== 'NO_SHOW')
  const pasadas = citas.filter(c => c.estado === 'FINALIZADA')
  const fechaHoy = hoy.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ minHeight: '100dvh', background: BG, color: TEXT1, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .grid-metrics { grid-template-columns: repeat(2,1fr) !important; }
          .grid-cards { grid-template-columns: 1fr !important; }
          .main-pad { padding: 20px 16px !important; }
          .titulo-pac { font-size: 28px !important; }
          .confirm-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile-btn { display: none !important; }
          .grid-metrics { grid-template-columns: repeat(4,1fr) !important; }
          .grid-cards { grid-template-columns: repeat(2,1fr) !important; }
          .main-pad { padding: 36px 28px !important; }
          .confirm-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <header style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: GREEN, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>V</span>
            </div>
            <span style={{ color: TEXT1, fontWeight: 700, fontSize: 15 }}>Vorticci Med</span>
          </div>

          {/* Desktop */}
          <div className="nav-desktop" style={{ alignItems: 'center', gap: 16 }}>
            <span style={{ color: TEXT2, fontSize: 13 }}>{nombre}</span>
            <span style={{ color: TEXT3 }}>·</span>
            <span style={{ color: GREEN, fontSize: 13, fontWeight: 600 }}>Portal paciente</span>
            <span style={{ color: TEXT3, fontSize: 13 }}>{fechaHoy}</span>
            <button onClick={() => { logout(); router.push('/login') }} style={{ background: 'none', border: 'none', color: TEXT2, fontSize: 13, cursor: 'pointer' }}>Salir</button>
          </div>

          {/* Mobile */}
          <button className="nav-mobile-btn" onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5 }}>
            <div style={{ width: 20, height: 2, background: TEXT1, borderRadius: 2, transition: 'all 0.2s', transform: menuAbierto ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <div style={{ width: 20, height: 2, background: TEXT1, borderRadius: 2, opacity: menuAbierto ? 0 : 1 }} />
            <div style={{ width: 20, height: 2, background: TEXT1, borderRadius: 2, transition: 'all 0.2s', transform: menuAbierto ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
        </div>

        {menuAbierto && (
          <div style={{ background: SURFACE, borderTop: `1px solid ${BORDER}`, padding: '16px 20px' }}>
            <div style={{ color: TEXT1, fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{nombre}</div>
            <div style={{ color: GREEN, fontSize: 13, marginBottom: 16 }}>Portal paciente</div>
            <button onClick={() => { logout(); router.push('/login') }} style={{ width: '100%', background: 'rgba(196,106,106,0.1)', border: '1px solid rgba(196,106,106,0.3)', color: '#C46A6A', borderRadius: 8, padding: '10px', fontSize: 14, cursor: 'pointer' }}>
              Cerrar sesión
            </button>
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', borderTop: `1px solid ${BORDER}`, overflowX: 'auto' }}>
          {([
            { id: 'inicio', label: 'Inicio' },
            { id: 'citas', label: 'Mis citas', badge: proximas.length },
            { id: 'historial', label: 'Historial', badge: pasadas.length },
          ] as { id: Vista; label: string; badge?: number }[]).map(t => (
            <button key={t.id} onClick={() => setVista(t.id)} style={{
              background: 'none', border: 'none', padding: '12px 20px', fontSize: 15, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
              color: vista === t.id ? TEXT1 : TEXT2,
              borderBottom: vista === t.id ? `2px solid ${TEXT1}` : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {t.label}
              {t.badge ? <span style={{ background: GREEN, color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 6px' }}>{t.badge}</span> : null}
            </button>
          ))}
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="main-pad">
        {cargando && <div style={{ textAlign: 'center', color: TEXT3, paddingTop: 60 }}>Cargando...</div>}

        {/* INICIO */}
        {!cargando && vista === 'inicio' && <>
          <h1 className="titulo-pac" style={{ fontSize: 34, fontWeight: 700, color: TEXT1, marginBottom: 4 }}>{nombre.split(' ')[0]}</h1>
          <p style={{ fontSize: 14, color: TEXT2, marginBottom: 24, textTransform: 'capitalize' }}>{fechaHoy}</p>

          <div className="grid-metrics" style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Próxima cita', big: proximas[0] ? formatCorta(proximas[0].fecha_hora) : '—', sub: proximas[0] ? formatHora(proximas[0].fecha_hora) : '' },
              { label: 'Hora', big: proximas[0] ? formatHora(proximas[0].fecha_hora) : '—', sub: '' },
              { label: 'Total consultas', big: String(pasadas.length), sub: 'Finalizadas' },
              { label: 'Pendientes', big: String(proximas.length), sub: 'Próximas' },
            ].map((m, i) => (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT3, marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: TEXT1, marginBottom: 2 }}>{m.big}</div>
                {m.sub && <div style={{ fontSize: 12, color: TEXT2 }}>{m.sub}</div>}
              </div>
            ))}
          </div>

          <div className="grid-cards" style={{ display: 'grid', gap: 12 }}>
            {/* Próxima cita */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TEXT3, marginBottom: 12 }}>Próxima cita</div>
              {proximas[0] ? (() => {
                const cfg = ESTADO_CONFIG[proximas[0].estado] ?? { label: proximas[0].estado, color: TEXT1, bg: '#ffffff15' }
                return <>
                  <span style={{ fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: 6, display: 'inline-block', marginBottom: 10 }}>{cfg.label}</span>
                  <div style={{ fontSize: 20, fontWeight: 700, color: TEXT1, marginBottom: 4 }}>{proximas[0].motivo}</div>
                  <div style={{ fontSize: 13, color: TEXT2, marginBottom: 14 }}>{proximas[0].profesional?.usuario?.nombre ?? 'Médico'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#0D1117', borderRadius: 8, padding: '12px', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: TEXT3, marginBottom: 4 }}>Fecha</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT1 }}>{formatFecha(proximas[0].fecha_hora)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: TEXT3, marginBottom: 4 }}>Hora</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT1 }}>{formatHora(proximas[0].fecha_hora)}</div>
                    </div>
                  </div>
                </>
              })() : <div style={{ fontSize: 14, color: TEXT3, textAlign: 'center', padding: '20px 0' }}>Sin citas próximas</div>}
            </div>

            {/* Última consulta */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TEXT3, marginBottom: 12 }}>Última consulta</div>
              {pasadas[0] ? <>
                <div style={{ fontSize: 13, color: TEXT2, marginBottom: 14 }}>{formatFecha(pasadas[0].fecha_hora)} · {pasadas[0].profesional?.usuario?.nombre ?? 'Médico'}</div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: TEXT3, marginBottom: 6 }}>Diagnóstico</div>
                  <div style={{ fontSize: 14, color: TEXT1, lineHeight: 1.6 }}>{pasadas[0].ficha?.diagnostico ?? 'Sin diagnóstico registrado'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: TEXT3, marginBottom: 6 }}>Indicaciones</div>
                  <div style={{ fontSize: 14, color: TEXT1, lineHeight: 1.6 }}>{pasadas[0].ficha?.indicaciones ?? '—'}</div>
                </div>
              </> : <div style={{ fontSize: 14, color: TEXT3, textAlign: 'center', padding: '20px 0' }}>Sin consultas previas</div>}
            </div>
          </div>
        </>}

        {/* MIS CITAS */}
        {!cargando && vista === 'citas' && <>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT1, marginBottom: 4 }}>Mis citas</h1>
          <p style={{ fontSize: 14, color: TEXT2, marginBottom: 20 }}>{proximas.length} cita{proximas.length !== 1 ? 's' : ''} próxima{proximas.length !== 1 ? 's' : ''}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {proximas.length === 0 && <div style={{ background: CARD, borderRadius: 12, padding: 32, textAlign: 'center', color: TEXT3, fontSize: 14, border: `1px solid ${BORDER}` }}>No hay citas programadas</div>}
            {proximas.map(c => {
              const cfg = ESTADO_CONFIG[c.estado] ?? { label: c.estado, color: TEXT1, bg: '#ffffff15' }
              return (
                <div key={c.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: 6, display: 'inline-block', marginBottom: 8 }}>{cfg.label}</span>
                      <div style={{ fontSize: 17, fontWeight: 700, color: TEXT1, marginBottom: 4 }}>{c.motivo}</div>
                      <div style={{ fontSize: 13, color: TEXT2 }}>{c.profesional?.usuario?.nombre ?? 'Médico'}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: TEXT1 }}>{formatCorta(c.fecha_hora)}</div>
                      <div style={{ fontSize: 13, color: TEXT2 }}>{formatHora(c.fecha_hora)}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>}

        {/* HISTORIAL */}
        {!cargando && vista === 'historial' && <>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT1, marginBottom: 4 }}>Historial</h1>
          <p style={{ fontSize: 14, color: TEXT2, marginBottom: 20 }}>{pasadas.length} consultas registradas</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pasadas.length === 0 && <div style={{ background: CARD, borderRadius: 12, padding: 32, textAlign: 'center', color: TEXT3, fontSize: 14, border: `1px solid ${BORDER}` }}>Sin historial</div>}
            {pasadas.map(h => (
              <div key={h.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setExpandido(expandido === h.id ? null : h.id)}>
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: TEXT1, marginBottom: 2 }}>{h.motivo}</div>
                    <div style={{ fontSize: 13, color: TEXT2 }}>{formatFecha(h.fecha_hora)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(74,222,128,0.15)', color: '#4ADE80', padding: '3px 10px', borderRadius: 6 }}>Finalizada</span>
                    <span style={{ color: TEXT3, fontSize: 18, transform: expandido === h.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'block' }}>⌄</span>
                  </div>
                </div>
                {expandido === h.id && (
                  <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${BORDER}` }}>
                    <div className="confirm-grid" style={{ display: 'grid', gap: 20, paddingTop: 16 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: TEXT3, marginBottom: 6 }}>Diagnóstico</div>
                        <div style={{ fontSize: 14, color: TEXT1, lineHeight: 1.6 }}>{h.ficha?.diagnostico ?? '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: TEXT3, marginBottom: 6 }}>Indicaciones</div>
                        <div style={{ fontSize: 14, color: TEXT1, lineHeight: 1.6 }}>{h.ficha?.indicaciones ?? '—'}</div>
                        {h.ficha?.proximo_control && (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: TEXT3, marginBottom: 4 }}>Próximo control</div>
                            <div style={{ fontSize: 14, color: TEXT1 }}>{h.ficha.proximo_control}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  )
}
