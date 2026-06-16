'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth.store'

const COLA_DEMO = [
  { id: '1', nombre: 'Carmen Silva', motivo: 'Dolor rodilla', hora: '10:46', estado: 'EN_ATENCION', rut: '15.666.777-8', edad: 52, prevision: 'FONASA C', antecedentes: ['HTA en tratamiento', 'Alergia a ibuprofeno', 'Cx meniscal 2018'], llegada: 51, duracion: 30 },
  { id: '2', nombre: 'Rosa Méndez', motivo: 'Control post-operatorio', hora: '11:00', estado: 'CHECK_IN', rut: '16.111.222-3', edad: 45, prevision: 'Isapre Cruz Blanca', antecedentes: ['Diabetes tipo 2'], llegada: 12, duracion: 30 },
  { id: '3', nombre: 'Pedro Vargas', motivo: 'Seguimiento tratamiento', hora: '11:30', estado: 'CONFIRMADA', rut: '13.444.555-6', edad: 38, prevision: 'FONASA B', antecedentes: [], llegada: null, duracion: 30 },
  { id: '4', nombre: 'Miguel Araya', motivo: 'Primera consulta', hora: '12:00', estado: 'CONFIRMADA', rut: '14.999.000-1', edad: 61, prevision: 'FONASA D', antecedentes: ['HTA', 'Dislipidemia'], llegada: null, duracion: 45 },
  { id: '5', nombre: 'Pilar Campos', motivo: 'Control mensual', hora: '12:30', estado: 'CREADA', rut: '17.333.444-5', edad: 29, prevision: 'Isapre Colmena', antecedentes: [], llegada: null, duracion: 30 },
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
  const [notas, setNotas] = useState({ diagnostico: '', indicaciones: '', proximo: '' })

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
  const siguiente = cola.find(p => p.estado === 'CHECK_IN') || null
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
    setNotas({ diagnostico: '', indicaciones: '', proximo: '' })
  }

  const noAsistio = () => {
  if (!pacienteActual) return
  setCola(prev => {
    const updated = prev.map(p =>
      p.id === pacienteActual.id ? { ...p, estado: 'NO_SHOW' } : p
    )
    const nextCheckIn = updated.find(p => p.estado === 'CHECK_IN')
    if (nextCheckIn) {
      return updated.map(p => p.id === nextCheckIn.id ? { ...p, estado: 'EN_ATENCION' } : p)
    }
    return updated
  })
  setTimer(0)
  setNotas({ diagnostico: '', indicaciones: '', proximo: '' })
}

  const minutos = Math.floor(timer / 60)
  const segundos = timer % 60
  const timerStr = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
  const duracionSecs = (pacienteActual?.duracion || 30) * 60
  const progreso = Math.min((timer / duracionSecs) * 100, 100)
  const timerColor = progreso >= 100 ? '#F09595' : progreso > 80 ? '#FAC775' : '#97C459'

  return (
    <div className="h-screen bg-[#0A0F0D] flex flex-col overflow-hidden">

      {/* Topbar */}
      <header className="border-b border-white/10 bg-[#0D1410] px-8 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-5">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-[#1D9E75] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="text-white font-semibold text-sm">Vorticci Med</span>
          </button>
          <div className="w-px h-4 bg-white/10"></div>
          <span className="text-white/80 text-sm font-medium">
            {usuario ? `Dr. ${usuario.nombre} ${usuario.apellido}` : 'Médico'}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse"></div>
            <span className="text-[#1D9E75] text-sm font-medium">En atención · Box 3</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-sm">
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <button onClick={logout} className="text-white/40 hover:text-white text-sm transition-colors">Salir</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* Panel principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {pacienteActual ? (
            <>
              {/* Header paciente */}
              <div className="px-8 py-5 border-b border-white/8 flex items-start justify-between flex-shrink-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: '#FAC77522', color: '#FAC775' }}>
                      EN ATENCIÓN
                    </span>
                    <span className="text-white/40 text-sm">Folio VM-005</span>
                  </div>
                  <h1 className="text-white text-4xl font-bold mb-1 leading-tight">{pacienteActual.nombre}</h1>
                  <p className="text-white/70 text-lg font-medium">{pacienteActual.motivo}</p>
                </div>
                <div className="text-right ml-8 flex-shrink-0">
                  <div className="text-5xl font-bold tabular-nums mb-1" style={{ color: timerColor }}>{timerStr}</div>
                  <div className="text-white/50 text-xs mb-2">de {pacienteActual.duracion} min asignados</div>
                  <div className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${progreso}%`, background: timerColor }} />
                  </div>
                </div>
              </div>

              {/* Contenido scrollable */}
              <div className="flex-1 overflow-y-auto px-8 py-5 flex flex-col gap-5">

                {/* Info grid */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'RUT', value: pacienteActual.rut },
                    { label: 'Edad', value: `${pacienteActual.edad} años` },
                    { label: 'Previsión', value: pacienteActual.prevision },
                    { label: 'Hora cita', value: pacienteActual.hora },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#161A18] rounded-xl p-4 border border-white/10">
                      <div className="text-white/60 text-xs uppercase tracking-wider mb-1.5 font-semibold">{label}</div>
                      <div className="text-white font-bold text-base">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Antecedentes */}
                {pacienteActual.antecedentes.length > 0 && (
                  <div className="bg-[#161A18] rounded-xl p-5 border border-white/10">
                    <div className="text-white/60 text-xs uppercase tracking-wider mb-3 font-semibold">Antecedentes relevantes</div>
                    <div className="flex flex-wrap gap-2">
                      {pacienteActual.antecedentes.map((a, i) => (
                        <span key={i} className="text-sm px-3 py-1.5 rounded-full font-semibold" style={{ background: '#FAC77518', color: '#FAC775', border: '1px solid #FAC77440' }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notas estructuradas */}
                <div className="bg-[#161A18] rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/8">
                    <div className="text-white/60 text-xs uppercase tracking-wider font-semibold">Notas de consulta</div>
                  </div>
                  <div className="divide-y divide-white/8">
                    {[
                      { key: 'diagnostico', label: 'Diagnóstico', placeholder: 'Ej: Gonartrosis grado II rodilla derecha...' },
                      { key: 'indicaciones', label: 'Indicaciones', placeholder: 'Ej: Reposo relativo, ibuprofeno 400mg cada 8h...' },
                      { key: 'proximo', label: 'Próximo control', placeholder: 'Ej: Control en 3 semanas con Rx...' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key} className="px-5 py-3">
                        <div className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-1.5">{label}</div>
                        <textarea
                          value={notas[key as keyof typeof notas]}
                          onChange={e => setNotas(n => ({ ...n, [key]: e.target.value }))}
                          className="w-full bg-transparent text-white text-sm resize-none outline-none placeholder:text-white/25 leading-relaxed"
                          rows={2}
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Acciones — fijas abajo */}
              <div className="px-8 py-4 border-t border-white/8 bg-[#0D1410] flex gap-3 flex-shrink-0">
                <button
                  onClick={finalizarConsulta}
                  className="flex-1 bg-[#1D9E75] hover:bg-[#25B587] text-white font-bold py-3.5 rounded-xl text-base transition-colors"
                >
                  ✓ Finalizar consulta
                </button>
                <button
  onClick={noAsistio}
  className="px-6 py-3.5 rounded-xl text-sm font-semibold border transition-colors"
  style={{ color: '#F09595', borderColor: '#F0959540', background: '#F0959510' }}
>
  No asistió
</button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-7xl mb-6">✓</div>
              <h2 className="text-white text-3xl font-bold mb-3">Sin pacientes en atención</h2>
              <p className="text-white/50 text-lg">Todos los pacientes del día han sido atendidos</p>
            </div>
          )}
        </div>

        {/* Sidebar cola */}
        <div className="border-l border-white/8 bg-[#0D1410] flex flex-col flex-shrink-0" style={{ width: '280px' }}>
          <div className="px-5 py-4 border-b border-white/8">
            <div className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-1">Cola del día</div>
            <div className="text-white text-xl font-bold">{cola.length} pacientes</div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {siguiente && (
              <div className="rounded-xl p-4 mb-1" style={{ background: '#AFA9EC12', border: '1px solid #AFA9EC40' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#AFA9EC' }}>→ Siguiente</span>
                  <span className="text-white/50 text-sm">{siguiente.hora}</span>
                </div>
                <div className="text-white font-bold text-base mb-1">{siguiente.nombre}</div>
                <div className="text-white/70 text-sm">{siguiente.motivo}</div>
                {siguiente.llegada && (
                  <div className="mt-2 text-sm font-semibold" style={{ color: siguiente.llegada > 20 ? '#F09595' : '#97C459' }}>
                    {siguiente.llegada} min esperando
                  </div>
                )}
              </div>
            )}

            {siguientes.filter(p => p.id !== siguiente?.id).map((p) => {
              const est = ESTADO_LABEL[p.estado]
              return (
                <div key={p.id} className="bg-[#161A18] rounded-xl p-4 border border-white/8">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold" style={{ color: est.color }}>{est.label}</span>
                    <span className="text-white/50 text-sm">{p.hora}</span>
                  </div>
                  <div className="text-white font-semibold text-sm mb-0.5">{p.nombre}</div>
                  <div className="text-white/60 text-sm">{p.motivo}</div>
                </div>
              )
            })}

            {finalizados.length > 0 && (
              <>
                <div className="text-white/30 text-xs uppercase tracking-widest px-1 mt-3 mb-1 font-semibold">Completadas</div>
                {finalizados.map(p => (
                  <div key={p.id} className="rounded-xl p-3 border border-white/5 opacity-40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#97C459]">✓</span>
                      <span className="text-white/40 text-xs">{p.hora}</span>
                    </div>
                    <div className="text-white/70 text-sm">{p.nombre}</div>
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