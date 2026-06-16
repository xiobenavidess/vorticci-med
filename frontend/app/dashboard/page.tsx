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

export default function DashboardPage() {
  const { usuario, logout } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({ total: 0, confirmadas: 0, enAtencion: 0, noShow: 0 })
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    cargarStats()
  }, [mounted])

  const cargarStats = async () => {
    try {
      const citas = await api.citas.delDia()
      setStats({
        total:       citas.length,
        confirmadas: citas.filter((c: any) => c.estado === 'CONFIRMADA').length,
        enAtencion:  citas.filter((c: any) => c.estado === 'EN_ATENCION').length,
        noShow:      citas.filter((c: any) => c.estado === 'NO_SHOW').length,
      })
    } catch (e) { console.error('Error cargando stats:', e) }
  }

  if (!mounted || !usuario) return null

  const acciones = [
    { label: 'Ver agenda de hoy',    desc: 'Kanban operacional en tiempo real', href: '/recepcion', emoji: '📋' },
    { label: 'Agendar paciente',     desc: 'Crear nueva cita en segundos',       href: '/recepcion', emoji: '➕' },
    { label: 'Confirmar asistencia', desc: 'Gestionar confirmaciones del día',    href: '/recepcion', emoji: '✓'  },
    { label: 'Gestionar pacientes',  desc: 'Fichas y historial de pacientes',     href: '/pacientes', emoji: '👤' },
    { label: 'Consulta médica',      desc: 'Dashboard del médico en box',         href: '/medico',    emoji: '🩺' },
    { label: 'Portal del paciente',  desc: 'Vista del paciente con sus citas',    href: '/paciente',  emoji: '📄' },
  ]

  const statCards = [
    { label: 'Citas hoy',   value: stats.total,      color: TEXT1    },
    { label: 'Confirmadas', value: stats.confirmadas, color: '#6B9FD4' },
    { label: 'En atención', value: stats.enAtencion,  color: '#D4A84B' },
    { label: 'No show',     value: stats.noShow,      color: '#C46A6A' },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: BG, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* NAVBAR */}
      <header style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: GREEN, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>V</span>
            </div>
            <span style={{ color: TEXT1, fontWeight: 700, fontSize: 16 }}>Vorticci Med</span>
          </div>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="hidden-mobile">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN }} />
              <span style={{ color: GREEN, fontSize: 13, fontWeight: 500 }}>Sistema activo</span>
            </div>
            <span style={{ color: TEXT2, fontSize: 14 }}>{usuario.nombre} {usuario.apellido}</span>
            <button onClick={() => { logout(); router.push('/login') }} style={{ background: 'none', border: 'none', color: TEXT3, fontSize: 14, cursor: 'pointer' }}>Salir</button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'none' }} className="show-mobile">
            <div style={{ width: 22, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ height: 2, background: TEXT1, borderRadius: 2, transition: 'all 0.2s', transform: menuAbierto ? 'rotate(45deg) translateY(7px)' : 'none' }} />
              <div style={{ height: 2, background: TEXT1, borderRadius: 2, opacity: menuAbierto ? 0 : 1, transition: 'all 0.2s' }} />
              <div style={{ height: 2, background: TEXT1, borderRadius: 2, transition: 'all 0.2s', transform: menuAbierto ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuAbierto && (
          <div style={{ background: SURFACE, borderTop: `1px solid ${BORDER}`, padding: '16px 20px', display: 'none' }} className="show-mobile">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN }} />
              <span style={{ color: GREEN, fontSize: 14 }}>Sistema activo</span>
            </div>
            <div style={{ color: TEXT2, fontSize: 14, marginBottom: 16 }}>{usuario.nombre} {usuario.apellido}</div>
            <button onClick={() => { logout(); router.push('/login') }} style={{ background: 'rgba(196,106,106,0.1)', border: '1px solid rgba(196,106,106,0.3)', color: '#C46A6A', borderRadius: 8, padding: '10px 16px', fontSize: 14, cursor: 'pointer', width: '100%' }}>
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .show-mobile-block { display: block !important; }
          .grid-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .grid-acciones { grid-template-columns: 1fr !important; }
          .main-padding { padding: 24px 16px !important; }
          .stat-value { font-size: 36px !important; }
          .accion-card { flex-direction: row !important; align-items: center !important; gap: 16px !important; padding: 18px 16px !important; }
          .accion-icon { width: 44px !important; height: 44px !important; flex-shrink: 0 !important; }
          .titulo-saludo { font-size: 32px !important; }
        }
        @media (min-width: 641px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
          .show-mobile-block { display: none !important; }
          .grid-stats { grid-template-columns: repeat(4, 1fr) !important; }
          .grid-acciones { grid-template-columns: repeat(3, 1fr) !important; }
          .main-padding { padding: 48px 40px !important; }
        }
      `}</style>

      <main className="main-padding" style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Saludo */}
        <div style={{ marginBottom: 32 }}>
          <h1 className="titulo-saludo" style={{ color: TEXT1, fontSize: 42, fontWeight: 700, margin: '0 0 8px 0', lineHeight: 1.2 }}>
            Hola, {usuario.nombre} 👋
          </h1>
          <p style={{ color: TEXT2, fontSize: 15, margin: 0 }}>
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' · '}
            <span style={{ color: GREEN, fontWeight: 600 }}>{usuario.rol.replace('_', ' ')}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid-stats" style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
          {statCards.map(({ label, value, color }) => (
            <div key={label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 20px' }}>
              <div className="stat-value" style={{ fontSize: 44, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
              <div style={{ color: GREEN, fontSize: 13, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Acciones */}
        <p style={{ color: TEXT3, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
          ¿Qué deseas hacer?
        </p>
        <div className="grid-acciones" style={{ display: 'grid', gap: 10 }}>
          {acciones.map(({ label, desc, emoji, href }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="accion-card"
              style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '24px 20px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16, transition: 'border-color 0.15s, background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GREEN; (e.currentTarget as HTMLElement).style.background = '#21262D' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.background = CARD }}
            >
              <div className="accion-icon" style={{ width: 48, height: 48, background: `${GREEN}18`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {emoji}
              </div>
              <div>
                <div style={{ color: TEXT1, fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{label}</div>
                <div style={{ color: TEXT2, fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
