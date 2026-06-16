'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth.store'
import { api } from '@/lib/api'

export default function DashboardPage() {
  const { usuario, logout } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({ total: 0, confirmadas: 0, enAtencion: 0, noShow: 0 })

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
    } catch (e) {
      console.error('Error cargando stats:', e)
    }
  }

  if (!mounted || !usuario) return null

  const acciones = [
    {
      label: 'Ver agenda de hoy',
      desc: 'Kanban operacional en tiempo real',
      href: '/recepcion',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><rect x="7" y="14" width="3" height="3" rx="0.5"/>
        </svg>
      ),
    },
    {
      label: 'Agendar paciente',
      desc: 'Crear nueva cita en segundos',
      href: '/recepcion',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
    },
    {
      label: 'Confirmar asistencia',
      desc: 'Gestionar confirmaciones del día',
      href: '/recepcion',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      ),
    },
    {
      label: 'Gestionar pacientes',
      desc: 'Fichas y historial de pacientes',
      href: '/pacientes',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      ),
    },
    {
      label: 'Consulta médica',
      desc: 'Dashboard del médico en box',
      href: '/medico',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M9 14h6l1 7H8l1-7z"/><path d="M9 14l-2-3M15 14l2-3"/>
        </svg>
      ),
    },
    {
      label: 'Portal del paciente',
      desc: 'Vista del paciente con sus citas',
      href: '/paciente',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/>
        </svg>
      ),
    },
  ]

  const statCards = [
    { label: 'Citas hoy',   value: stats.total,       color: '#fff'    },
    { label: 'Confirmadas', value: stats.confirmadas,  color: '#85B7EB' },
    { label: 'En atención', value: stats.enAtencion,   color: '#FAC775' },
    { label: 'No show',     value: stats.noShow,       color: '#F09595' },
  ]

  return (
    <div className="min-h-screen bg-[#0A0F0D]">
      {/* Topbar */}
      <header className="border-b border-[#1D9E75]/20 bg-[#0D1410] px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1D9E75] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-base">V</span>
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">Vorticci Med</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1D9E75] animate-pulse"></div>
            <span className="text-[#1D9E75] text-base font-medium">Sistema activo</span>
          </div>
          <span className="text-white/70 text-base">{usuario.nombre} {usuario.apellido}</span>
          <button onClick={logout} className="text-white/40 hover:text-white text-base transition-colors">
            Salir
          </button>
        </div>
      </header>

      <main className="px-10 py-12 max-w-7xl mx-auto">
        {/* Saludo */}
        <div className="mb-12">
          <h1 className="text-white text-5xl font-bold mb-3">
            Hola, {usuario.nombre} 👋
          </h1>
          <p className="text-white/50 text-lg">
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' · '}
            <span className="text-[#1D9E75] font-medium">{usuario.rol.replace('_', ' ')}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-12">
          {statCards.map(({ label, value, color }) => (
            <div key={label} className="bg-[#182420] border border-[#1D9E75]/20 rounded-2xl p-7">
              <div className="text-5xl font-bold mb-3" style={{ color }}>{value}</div>
              <div className="text-[#5DCAA5] text-base font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Acciones */}
        <p className="text-white/40 text-sm font-semibold uppercase tracking-widest mb-6">
          ¿Qué deseas hacer?
        </p>
        <div className="grid grid-cols-3 gap-5">
          {acciones.map(({ label, desc, icon, href }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="flex flex-col gap-5 bg-[#182420] border border-[#1D9E75]/20 hover:border-[#1D9E75] hover:bg-[#1D2E27] rounded-2xl p-8 text-left transition-all group"
            >
              <div className="w-12 h-12 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center">
                {icon}
              </div>
              <div>
                <div className="text-white font-semibold text-lg mb-2 group-hover:text-[#1D9E75] transition-colors">
                  {label}
                </div>
                <div className="text-white/50 text-sm leading-relaxed">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}