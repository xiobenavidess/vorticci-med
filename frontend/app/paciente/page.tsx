'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth.store'

const CITAS_DEMO = [
  { id: '1', motivo: 'Control post-op rodilla', medico: 'Dr. Morales', especialidad: 'Traumatología', fecha: '2026-07-18', hora: '10:30', estado: 'CONFIRMADA' },
  { id: '2', motivo: 'Seguimiento kinesiología', medico: 'Dr. Morales', especialidad: 'Traumatología', fecha: '2026-08-02', hora: '11:00', estado: 'CREADA' },
]

const HISTORIAL_DEMO = [
  { id: '3', motivo: 'Control rodilla', fecha: '2026-02-18', medico: 'Dr. Morales', diagnostico: 'Tendinitis rotuliana bilateral. Reposo deportivo 3 semanas.', indicaciones: ['Ibuprofeno 400mg cada 8h por 5 días', 'Kinesiología 2x semana', 'Hielo local 15 min, 3x día'] },
  { id: '4', motivo: 'Dolor lumbar', fecha: '2026-01-30', medico: 'Dr. Morales', diagnostico: 'Contractura lumbar. Calor local y reposo relativo.', indicaciones: ['Miorrelajante 1 comp/noche x 5 días', 'Evitar sedestación prolongada'] },
  { id: '5', motivo: 'Primera consulta', fecha: '2023-12-05', medico: 'Dr. Morales', diagnostico: 'Evaluación inicial. Sin hallazgos agudos.', indicaciones: ['Control en 3 meses'] },
]

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CONFIRMADA:  { label: 'Confirmado', color: '#4ADE80', bg: 'rgba(74,222,128,0.15)' },
  CREADA:      { label: 'Agendado',   color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' },
  EN_ATENCION: { label: 'En atención', color: '#60A5FA', bg: 'rgba(96,165,250,0.15)' },
}

type Vista = 'inicio' | 'citas' | 'historial'

const W = '#FFFFFF'        // blanco puro — títulos y valores clave
const M = '#CBD5E1'        // gris claro — texto secundario legible
const S = '#64748B'        // gris medio — labels uppercase, metadatos
const CARD = '#1E293B'     // fondo card con buen contraste sobre #0F172A
const INNER = '#273449'    // fondo inner card (fecha/hora box)
const BG = '#0F172A'       // fondo página

function formatFecha(f: string) {
  return new Date(f).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatCorta(f: string) {
  return new Date(f).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: S, marginBottom: 8,
}

export default function PacientePage() {
  const { usuario, logout } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [vista, setVista] = useState<Vista>('inicio')
  const [expandido, setExpandido] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!mounted) return
    if (!localStorage.getItem('access_token')) router.push('/login')
  }, [mounted, router])

  if (!mounted) return null

  const nombre = usuario?.nombre ?? 'Paciente'
  const proximas = CITAS_DEMO.filter(c => new Date(c.fecha) >= new Date())
  const ultima = HISTORIAL_DEMO[0]
  const fechaHoy = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* NAVBAR */}
      <header style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', borderBottom: '1px solid #1E293B', background: BG }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>V</div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Vorticci Med</span>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ fontSize: 13, color: M }}>{nombre}</span>
          <span style={{ color: '#334155' }}>·</span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
          <span style={{ fontSize: 13, color: '#4ADE80' }}>Portal paciente</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 13, color: S, textTransform: 'capitalize' }}>{fechaHoy}</span>
          <button onClick={() => { logout(); router.push('/login') }} style={{ background: 'none', border: 'none', color: M, fontSize: 13, cursor: 'pointer' }}>Salir</button>
        </div>
      </header>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 0, padding: '0 28px', borderBottom: '1px solid #1E293B', background: BG }}>
        {([
          { id: 'inicio', label: 'Inicio' },
          { id: 'citas', label: 'Mis citas', badge: proximas.length },
          { id: 'historial', label: 'Historial' },
        ] as { id: Vista; label: string; badge?: number }[]).map(t => (
          <button key={t.id} onClick={() => setVista(t.id)} style={{
            background: 'none', border: 'none', padding: '14px 24px',
            fontSize: 16, fontWeight: 500, cursor: 'pointer',
            color: vista === t.id ? W : S,
            borderBottom: vista === t.id ? '2px solid #fff' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {t.label}
            {t.badge ? <span style={{ background: '#16A34A', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 7px' }}>{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div style={{ padding: '36px 28px' }}>

        {/* ── INICIO ── */}
        {vista === 'inicio' && <>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: W, marginBottom: 4 }}>{nombre.split(' ')[0]}</h1>
          <p style={{ fontSize: 14, color: M, marginBottom: 32, textTransform: 'capitalize' }}>{fechaHoy}</p>

          {/* Métricas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'RUT', big: usuario?.rut ?? '—', sub: '' },
              { label: 'Próxima cita', big: proximas[0] ? formatCorta(proximas[0].fecha) : '—', sub: proximas[0]?.hora ?? '' },
              { label: 'Total consultas', big: String(HISTORIAL_DEMO.length), sub: 'Desde dic 2023' },
              { label: 'Médico tratante', big: 'Dr. Morales', sub: 'Traumatología' },
            ].map((m, i) => (
              <div key={i} style={{ background: CARD, border: '1px solid #273449', borderRadius: 12, padding: '18px 20px' }}>
                <div style={LABEL}>{m.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: W, marginBottom: 4 }}>{m.big}</div>
                {m.sub && <div style={{ fontSize: 13, color: M }}>{m.sub}</div>}
              </div>
            ))}
          </div>

          {/* 2 cols */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Próxima cita */}
            <div style={{ background: CARD, border: '1px solid #273449', borderRadius: 12, padding: '22px 24px' }}>
              <div style={LABEL}>Próxima cita</div>
              {proximas[0] ? (() => {
                const cfg = ESTADO_CONFIG[proximas[0].estado] ?? { label: proximas[0].estado, color: W, bg: '#ffffff15' }
                return <>
                  <span style={{ fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color, padding: '4px 12px', borderRadius: 6, display: 'inline-block', marginBottom: 14 }}>{cfg.label}</span>
                  <div style={{ fontSize: 26, fontWeight: 700, color: W, marginBottom: 6 }}>{proximas[0].motivo}</div>
                  <div style={{ fontSize: 15, color: M, marginBottom: 18 }}>{proximas[0].medico} · {proximas[0].especialidad}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: INNER, borderRadius: 10, padding: '16px 18px', gap: 16 }}>
                    <div>
                      <div style={LABEL}>Fecha</div>
                      <div style={{ fontSize: 17, fontWeight: 600, color: W }}>{formatFecha(proximas[0].fecha)}</div>
                    </div>
                    <div>
                      <div style={LABEL}>Hora</div>
                      <div style={{ fontSize: 17, fontWeight: 600, color: W }}>{proximas[0].hora}</div>
                    </div>
                  </div>
                </>
              })() : (
                <div style={{ fontSize: 15, color: S, textAlign: 'center', padding: '28px 0' }}>Sin citas próximas</div>
              )}
            </div>

            {/* Última consulta */}
            <div style={{ background: CARD, border: '1px solid #273449', borderRadius: 12, padding: '22px 24px' }}>
              <div style={LABEL}>Última consulta</div>
              <div style={{ fontSize: 14, color: M, marginBottom: 18 }}>{formatFecha(ultima.fecha)} · {ultima.medico}</div>

              <div style={{ marginBottom: 20 }}>
                <div style={LABEL}>Diagnóstico</div>
                <div style={{ fontSize: 16, color: W, lineHeight: 1.6 }}>{ultima.diagnostico}</div>
              </div>

              <div>
                <div style={LABEL}>Indicaciones</div>
                {ultima.indicaciones.map((ind, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', marginTop: 6, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: W, lineHeight: 1.5 }}>{ind}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>}

        {/* ── MIS CITAS ── */}
        {vista === 'citas' && <>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: W, marginBottom: 6 }}>Mis citas</h1>
          <p style={{ fontSize: 14, color: M, marginBottom: 28 }}>{proximas.length} cita{proximas.length !== 1 ? 's' : ''} próxima{proximas.length !== 1 ? 's' : ''}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {proximas.length === 0 && (
              <div style={{ background: CARD, borderRadius: 12, padding: 40, textAlign: 'center', color: S, fontSize: 15, border: '1px solid #273449' }}>
                No hay citas programadas
              </div>
            )}
            {proximas.map(c => {
              const cfg = ESTADO_CONFIG[c.estado] ?? { label: c.estado, color: W, bg: '#ffffff15' }
              return (
                <div key={c.id} style={{ background: CARD, border: '1px solid #273449', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color, padding: '4px 12px', borderRadius: 6, display: 'inline-block', marginBottom: 12 }}>{cfg.label}</span>
                      <div style={{ fontSize: 22, fontWeight: 700, color: W, marginBottom: 6 }}>{c.motivo}</div>
                      <div style={{ fontSize: 15, color: M }}>{c.medico} · {c.especialidad}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 26, fontWeight: 700, color: W }}>{formatCorta(c.fecha)}</div>
                      <div style={{ fontSize: 16, color: M }}>{c.hora}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>}

        {/* ── HISTORIAL ── */}
        {vista === 'historial' && <>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: W, marginBottom: 6 }}>Historial de consultas</h1>
          <p style={{ fontSize: 14, color: M, marginBottom: 28 }}>{HISTORIAL_DEMO.length} consultas registradas</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {HISTORIAL_DEMO.map(h => (
              <div key={h.id} style={{ background: CARD, border: '1px solid #273449', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => setExpandido(expandido === h.id ? null : h.id)}>
                <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: W, marginBottom: 4 }}>{h.motivo}</div>
                    <div style={{ fontSize: 14, color: M }}>{formatFecha(h.fecha)} · {h.medico}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(74,222,128,0.15)', color: '#4ADE80', padding: '4px 12px', borderRadius: 6 }}>Finalizada</span>
                    <span style={{ fontSize: 20, color: S, display: 'block', transform: expandido === h.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
                  </div>
                </div>
                {expandido === h.id && (
                  <div style={{ padding: '0 24px 22px', borderTop: '1px solid #273449' }}>
                    <div style={{ paddingTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                      <div>
                        <div style={LABEL}>Diagnóstico</div>
                        <div style={{ fontSize: 15, color: W, lineHeight: 1.6 }}>{h.diagnostico}</div>
                      </div>
                      <div>
                        <div style={LABEL}>Indicaciones</div>
                        {h.indicaciones.map((ind, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', marginTop: 5, flexShrink: 0 }} />
                            <span style={{ fontSize: 15, color: W, lineHeight: 1.5 }}>{ind}</span>
                          </div>
                        ))}
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