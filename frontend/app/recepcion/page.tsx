'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useAuthStore } from '@/lib/auth.store'

const COLUMNAS = [
  { id: 'CREADA',      label: 'Esperando',   accent: '#D3D1C7' },
  { id: 'CONFIRMADA',  label: 'Confirmados', accent: '#85B7EB' },
  { id: 'CHECK_IN',    label: 'Check-in',    accent: '#AFA9EC' },
  { id: 'EN_ATENCION', label: 'En atención', accent: '#FAC775' },
  { id: 'FINALIZADA',  label: 'Finalizados', accent: '#97C459' },
  { id: 'NO_SHOW',     label: 'No show',     accent: '#F09595' },
]

const SIGUIENTE_ESTADO: Record<string, string> = {
  CREADA: 'CONFIRMADA',
  CONFIRMADA: 'CHECK_IN',
  CHECK_IN: 'EN_ATENCION',
  EN_ATENCION: 'FINALIZADA',
}

type EstadoCita = 'CREADA' | 'CONFIRMADA' | 'CHECK_IN' | 'EN_ATENCION' | 'FINALIZADA' | 'NO_SHOW'

interface Cita {
  id: string
  folio: string
  fecha_hora: string
  estado: EstadoCita
  motivo?: string
  llegada?: string
  paciente: { nombre: string; apellido: string; rut: string }
  profesional: { especialidad: string; color_agenda: string; usuario: { nombre: string; apellido: string } }
}

type Board = Record<EstadoCita, Cita[]>

const now = new Date()
const hace40 = new Date(now.getTime() - 40 * 60000).toISOString()
const hace15 = new Date(now.getTime() - 15 * 60000).toISOString()
const hace5  = new Date(now.getTime() - 5  * 60000).toISOString()

const DEMO_BOARD: Board = {
  CREADA: [
    { id: '1', folio: 'VM-001', fecha_hora: hace40, estado: 'CREADA', motivo: 'Control anual', llegada: hace40, paciente: { nombre: 'María', apellido: 'González', rut: '12.345.678-9' }, profesional: { especialidad: 'Traumatología', color_agenda: '#378ADD', usuario: { nombre: 'Dr. Reyes', apellido: '' } } },
    { id: '2', folio: 'VM-002', fecha_hora: hace15, estado: 'CREADA', motivo: 'Dolor lumbar', llegada: hace15, paciente: { nombre: 'Carlos', apellido: 'Pérez', rut: '11.222.333-4' }, profesional: { especialidad: 'Cardiología', color_agenda: '#EF9F27', usuario: { nombre: 'Dra. Mora', apellido: '' } } },
  ],
  CONFIRMADA: [
    { id: '3', folio: 'VM-003', fecha_hora: hace5, estado: 'CONFIRMADA', motivo: 'Seguimiento', paciente: { nombre: 'Pedro', apellido: 'Vargas', rut: '13.444.555-6' }, profesional: { especialidad: 'Traumatología', color_agenda: '#378ADD', usuario: { nombre: 'Dr. Reyes', apellido: '' } } },
  ],
  CHECK_IN: [
    { id: '4', folio: 'VM-004', fecha_hora: hace15, estado: 'CHECK_IN', motivo: 'Palpitaciones', llegada: hace15, paciente: { nombre: 'Tomás', apellido: 'Herrera', rut: '14.555.666-7' }, profesional: { especialidad: 'Cardiología', color_agenda: '#EF9F27', usuario: { nombre: 'Dra. Mora', apellido: '' } } },
  ],
  EN_ATENCION: [
    { id: '5', folio: 'VM-005', fecha_hora: hace40, estado: 'EN_ATENCION', motivo: 'Dolor rodilla', llegada: hace40, paciente: { nombre: 'Carmen', apellido: 'Silva', rut: '15.666.777-8' }, profesional: { especialidad: 'Traumatología', color_agenda: '#378ADD', usuario: { nombre: 'Dr. Reyes', apellido: '' } } },
  ],
  FINALIZADA: [
    { id: '6', folio: 'VM-006', fecha_hora: hace40, estado: 'FINALIZADA', motivo: 'Control anual', paciente: { nombre: 'Sofía', apellido: 'Núñez', rut: '16.777.888-9' }, profesional: { especialidad: 'Cardiología', color_agenda: '#EF9F27', usuario: { nombre: 'Dra. Mora', apellido: '' } } },
  ],
  NO_SHOW: [
    { id: '7', folio: 'VM-007', fecha_hora: hace40, estado: 'NO_SHOW', motivo: 'Revisión', paciente: { nombre: 'Hernán', apellido: 'Muñoz', rut: '17.888.999-0' }, profesional: { especialidad: 'Medicina General', color_agenda: '#1D9E75', usuario: { nombre: 'Dr. Lagos', apellido: '' } } },
  ],
}

function minutosDesde(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
}

function TiempoEspera({ desde }: { desde: string }) {
  const mins = minutosDesde(desde)
  const color = mins > 30 ? '#F09595' : mins > 15 ? '#FAC775' : '#97C459'
  return (
    <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>
      {mins} min
    </span>
  )
}

export default function RecepcionPage() {
  const { usuario } = useAuthStore()
  const router = useRouter()
  const [board, setBoard] = useState<Board>(DEMO_BOARD)
  const [hover, setHover] = useState<string | null>(null)

  useEffect(() => {
    if (!usuario) router.push('/login')
  }, [usuario, router])

  if (!usuario) return null

  const moverSiguiente = (cita: Cita) => {
    const siguiente = SIGUIENTE_ESTADO[cita.estado] as EstadoCita
    if (!siguiente) return
    const sourceCol = [...board[cita.estado]].filter(c => c.id !== cita.id)
    const destCol = [...board[siguiente], { ...cita, estado: siguiente }]
    setBoard({ ...board, [cita.estado]: sourceCol, [siguiente]: destCol })
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const { source, destination } = result
    if (source.droppableId === destination.droppableId) return
    const sourceCol = source.droppableId as EstadoCita
    const destCol = destination.droppableId as EstadoCita
    const sourceCitas = [...board[sourceCol]]
    const destCitas = [...board[destCol]]
    const [moved] = sourceCitas.splice(source.index, 1)
    moved.estado = destCol
    destCitas.splice(destination.index, 0, moved)
    setBoard({ ...board, [sourceCol]: sourceCitas, [destCol]: destCitas })
  }

  const totalCitas = Object.values(board).flat().length

  return (
    <div className="min-h-screen bg-[#0A0F0D] flex flex-col">

      {/* Topbar */}
      <header className="border-b border-white/10 bg-[#0D1410] px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-5">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-[#1D9E75] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-white font-semibold text-base">Vorticci Med</span>
          </button>
          <div className="w-px h-4 bg-white/10"></div>
          <span className="text-white/70 text-base">Recepción</span>
          <span className="text-white/30 text-sm hidden md:block">
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse"></div>
            <span className="text-[#1D9E75] text-base font-medium">{totalCitas} citas</span>
          </div>
          <button className="bg-[#1D9E75] hover:bg-[#25B587] text-white text-base font-semibold px-5 py-2 rounded-xl transition-colors">
            + Nueva cita
          </button>
        </div>
      </header>

      {/* Resumen del día */}
      <div className="px-8 py-5 border-b border-white/8 bg-[#0D1410] flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-white text-2xl font-bold">Hoy</h2>
          <span className="text-white/30 text-lg">
            {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-white text-3xl font-bold">{totalCitas}</span>
            <span className="text-white/40 text-sm uppercase tracking-wide">citas hoy</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex items-center gap-2">
            <span className="text-[#AFA9EC] text-2xl font-bold">{board.CHECK_IN.length}</span>
            <span className="text-white/40 text-sm uppercase tracking-wide">en sala</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex items-center gap-2">
            <span className="text-[#FAC775] text-2xl font-bold">{board.EN_ATENCION.length}</span>
            <span className="text-white/40 text-sm uppercase tracking-wide">en consulta</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex items-center gap-2">
            <span className="text-[#97C459] text-2xl font-bold">{board.FINALIZADA.length}</span>
            <span className="text-white/40 text-sm uppercase tracking-wide">completadas</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex items-center gap-2">
            <span className="text-[#F09595] text-2xl font-bold">{board.NO_SHOW.length}</span>
            <span className="text-white/40 text-sm uppercase tracking-wide">no show</span>
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 min-w-max h-full">
            {COLUMNAS.map(({ id, label, accent }) => {
              const citas = board[id as EstadoCita] || []
              return (
                <div key={id} className="flex flex-col flex-1 min-w-60 max-w-80">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: accent }}></div>
                      <span className="text-sm font-bold uppercase tracking-wider" style={{ color: accent }}>
                        {label}
                      </span>
                    </div>
                    <span className="text-sm font-bold px-2.5 py-0.5 rounded-full" style={{ background: `${accent}18`, color: accent }}>
                      {citas.length}
                    </span>
                  </div>

                  <Droppable droppableId={id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex flex-col gap-3 rounded-xl p-1.5 transition-all min-h-20 flex-1"
                        style={{ background: snapshot.isDraggingOver ? `${accent}0D` : 'transparent' }}
                      >
                        {citas.map((cita, idx) => (
                          <Draggable key={cita.id} draggableId={cita.id} index={idx}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                onMouseEnter={() => setHover(cita.id)}
                                onMouseLeave={() => setHover(null)}
                                className="bg-[#161A18] rounded-xl p-5 cursor-grab active:cursor-grabbing transition-all"
                                style={{
                                  borderTop: '1px solid rgba(255,255,255,0.09)',
                                  borderRight: '1px solid rgba(255,255,255,0.09)',
                                  borderBottom: '1px solid rgba(255,255,255,0.09)',
                                  borderLeft: `3px solid ${cita.profesional.color_agenda}`,
                                  boxShadow: snap.isDragging ? '0 12px 32px rgba(0,0,0,0.5)' : undefined,
                                  ...prov.draggableProps.style,
                                }}
                              >
                                <div className="text-white font-bold text-lg mb-2 leading-tight">
                                  {cita.paciente.nombre} {cita.paciente.apellido}
                                </div>
                                <div className="text-white/80 text-base font-medium mb-1">
                                  {cita.profesional.usuario.nombre}
                                  <span className="text-white/30 mx-1.5">·</span>
                                  <span className="text-white/60">{cita.profesional.especialidad}</span>
                                </div>
                                {cita.motivo && (
                                  <div className="text-white/50 text-sm mb-4">{cita.motivo}</div>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-white/40 text-sm font-medium">
                                    {new Date(cita.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {cita.llegada && <TiempoEspera desde={cita.llegada} />}
                                    {SIGUIENTE_ESTADO[cita.estado] && hover === cita.id && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); moverSiguiente(cita) }}
                                        className="text-sm font-semibold px-3 py-1 rounded-lg transition-all"
                                        style={{ background: `${accent}25`, color: accent }}
                                      >
                                        → Siguiente
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}