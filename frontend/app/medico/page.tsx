'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth.store'

const COLA_DEMO = [
  { id: '1', nombre: 'Carmen Silva', motivo: 'Dolor rodilla', hora: '10:46', estado: 'EN_ATENCION', rut: '15.666.777-8', edad: 52, prevision: 'FONASA C', antecedentes: ['HTA en tratamiento', 'Alergia a ibuprofeno', 'Cx meniscal 2018'], llegada: 51 },
  { id: '2', nombre: 'Rosa Méndez', motivo: 'Control post-operatorio', hora: '11:00', estado: 'CHECK_IN', rut: '16.111.222-3', edad: 45, prevision: 'Isapre Cruz Blanca', antecedentes: ['Diabetes tipo 2'], llegada: 12 },
  { id: '3', nombre: 'Pedro Vargas', motivo: 'Seguimiento tratamiento', hora: '11:30', estado: 'CONFIRMADA', rut: '13.444.555-6', edad: 38, prevision: 'FONASA B', antecedentes: [], llegada: null },
  { id: '4', nombre: 'Miguel Araya', motivo: 'Primera consulta', hora: '12:00', estado: 'CONFIRMADA', rut: '14.999.000-1', edad: 61, prevision: 'FONASA D', antecedentes: ['HTA', 'Dislipidemia'], llegada: null },
  { id: '5', nombre: 'Pilar Campos', motivo: 'Control mensual', hora: '12:30', estado: 'CREADA', rut: '17.333.444-5', edad: 29, prevision: 'Isapre Colmena', antecedentes: [], llegada: null },
]

const ESTADO_LABEL: Record<string, { label: string; color: string }> = {
  EN_ATENCION: { label: 'En atención', color: '#FAC775' },
  CHECK_IN:    { label: 'En sala',     color: '#AFA9EC' },
  CONFIRMADA:  { label: 'Confirmado',  color: '#85B7EB' },
  CREADA:      { label: 'Agendado',    color: '#D3D1C7' },
  FINALIZADA:  { label: 'Finalizado',  color: '#97C459' },
}

export default function MedicoPage() {
  const { usuario, logout } = useAuthStore()
  const router = useRouter()
  const [cola, setCola] = useState(COLA_DEMO)
  const [timer, setTimer] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const token = localStorage.getItem('access_token')
    if (!token) router.push('/login')
  }, [mounted, router])

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  const pacienteActual = cola.find(p => p.estado === 'EN_ATENCION') || null
  const siguientes = cola.filter(p => p.estado !== 'EN_ATENCION' && p.estado !== 'FINALIZADA')
  const finalizados = cola.filter(p => p.estado === 'FINALIZADA')

  const finalizarConsulta = () => {
    if (!pacienteActual) return
    setCola(prev => {
      const updated = prev.map(p =>
        p.id === pacienteActual.id ? { ...p, estado: 'FINALIZADA' } : p
      )
      const nextCheckIn = updated.find(p => p.estado === 'CHECK_IN')
      if (nextCheckIn) {
        return updated.map(p => p.id === nextCheckIn.id ? { ...p, estado: 'EN_ATENCION' } : p)
      }
      return updated
    })
    setTimer(0)
  }

  const minutos = Math.floor(timer / 60)
  const segundos = timer % 60
  const timerStr = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-[#0A0F0D] flex flex-col">
      <header className="border-b border-white/10 bg-[#0D1410] px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-5">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-[#1D9E75] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-white font-semibold text-base">Vorticci Med</span>
          </button>
          <div className="w-px h-4 bg-white/10"></div>
          <span className="text-white/70 text-base">
            {usuario ? `Dr. ${usuario.nombre} ${usuario.apellido}` : 'Médico'}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse"></div>
            <span className="text-[#1D9E75] text-sm font-medium">En atención · Box 3</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-sm">
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <button onClick={logout} className="text-white/30 hover:text-white text-sm transition-colors">Salir</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          {pacienteActual ? (
            <>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: '#FAC77522', color: '#FAC775' }}>
                      EN ATENCIÓN
                    </span>
                    <span className="text-white/30 text-sm">Folio VM-005</span>
                  </div>
                  <h1 className="text-white text-4xl font-bold mb-1">{pacienteActual.nombre}</h1>
                  <p className="text-white/50 text-lg">{pacienteActual.motivo}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold tabular-nums" style={{ color: timer > 1800 ? '#F09595' : timer > 900 ? '#FAC775' : '#97C459' }}>
                    {timerStr}
                  </div>
                  <div className="text-white/30 text-sm mt-1">tiempo en consulta</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'RUT', value: pacienteActual.rut },
                  { label: 'Edad', value: `${pacienteActual.edad} años` },
                  { label: 'Previsión', value: pacienteActual.prevision },
                  { label: 'Hora cita', value: pacienteActual.hora },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#161A18] rounded-xl p-4 border border-white/8">
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-2 font-medium">{label}</div>
                    <div className="text-white font-semibold text-base">{value}</div>
                  </div>
                ))}
              </div>

              {pacienteActual.antecedentes.length > 0 && (
                <div className="bg-[#161A18] rounded-xl p-6 border border-white/8 mb-8">
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-4 font-medium">Antecedentes relevantes</div>
                  <div className="flex flex-wrap gap-2">
                    {pacienteActual.antecedentes.map((a, i) => (
                      <span key={i} className="text-sm px-3 py-1.5 rounded-full font-medium" style={{ background: '#FAC77515', color: '#FAC775', border: '1px solid #FAC77530' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#161A18] rounded-xl p-6 border border-white/8 mb-8">
                <div className="text-white/40 text-xs uppercase tracking-wider mb-3 font-medium">Notas de consulta</div>
                <textarea
                  className="w-full bg-transparent text-white text-base resize-none outline-none placeholder:text-white/20 leading-relaxed"
                  rows={5}
                  placeholder="Escribe aquí el diagnóstico, indicaciones y notas de la consulta..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={finalizarConsulta}
                  className="flex-1 bg-[#1D9E75] hover:bg-[#25B587] text-white font-bold py-4 rounded-xl text-base transition-colors"
                >
                  ✓ Finalizar consulta
                </button>
                <button className="px-6 py-4 rounded-xl text-base font-semibold transition-colors" style={{ background: '#F0959515', color: '#F09595', border: '1px solid #F0959530' }}>
                  No asistió
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-white text-2xl font-bold mb-2">Sin pacientes en atención</h2>
              <p className="text-white/40">Todos los pacientes del día han sido atendidos</p>
            </div>
          )}
        </div>

        <div className="w-72 border-l border-white/8 bg-[#0D1410] flex flex-col flex-shrink-0">
          <div className="px-6 py-5 border-b border-white/8">
            <div className="text-white/40 text-xs uppercase tracking-widest font-medium mb-1">Cola del día</div>
            <div className="text-white text-2xl font-bold">{cola.length} pacientes</div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {siguientes.map((p) => {
              const est = ESTADO_LABEL[p.estado]
              return (
                <div key={p.id} className="bg-[#161A18] rounded-xl p-4 border border-white/8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: est.color }}>{est.label}</span>
                    <span className="text-white/30 text-xs">{p.hora}</span>
                  </div>
                  <div className="text-white font-semibold text-sm mb-1">{p.nombre}</div>
                  <div className="text-white/40 text-xs">{p.motivo}</div>
                  {p.llegada && (
                    <div className="mt-2 text-xs font-medium" style={{ color: p.llegada > 20 ? '#F09595' : '#97C459' }}>
                      {p.llegada} min en sala
                    </div>
                  )}
                </div>
              )
            })}
            {finalizados.length > 0 && (
              <>
                <div className="text-white/20 text-xs uppercase tracking-widest px-1 mt-3 mb-1">Completadas</div>
                {finalizados.map(p => (
                  <div key={p.id} className="rounded-xl p-4 border border-white/5 opacity-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#97C459]">Finalizado</span>
                      <span className="text-white/30 text-xs">{p.hora}</span>
                    </div>
                    <div className="text-white/60 font-medium text-sm">{p.nombre}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}