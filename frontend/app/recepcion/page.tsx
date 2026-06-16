'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useAuthStore } from '@/lib/auth.store'
import { api } from '@/lib/api'
import ModalAgendarCita from '@/components/ModalAgendarCita'

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
  profesional: { especialidad: string; color_agenda?: string; usuario: { nombre: string; apellido: string } }
}

type Board = Record<EstadoCita, Cita[]>

const BOARD_VACIO: Board = {
  CREADA: [], CONFIRMADA: [], CHECK_IN: [],
  EN_ATENCION: [], FINALIZADA: [], NO_SHOW: [],
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

function citasABoard(citas: any[]): Board {
  const board: Board = { CREADA: [], CONFIRMADA: [], CHECK_IN: [], EN_ATENCION: [], FINALIZADA: [], NO_SHOW: [] }
  for (const c of citas) {
    const estado = c.estado as EstadoCita
    if (board[estado]) {
      board[estado].push({
        id: c.id,
        folio: c.folio,
        fecha_hora: c.fecha_hora,
        estado,
        motivo: c.motivo,
        paciente: c.paciente,
        profesional: {
          especialidad: c.profesional.especialidad,
          color_agenda: c.profesional.color_agenda ?? '#1D9E75',
          usuario: c.profesional.usuario,
        },
      })
    }
  }
  return board
}

const CENTRO_ID      = 'a1b2c3d4-0000-0000-0000-000000000001'
const PROFESIONAL_ID = 'b2c3d4e5-0000-0000-0000-000000000002'

export default function RecepcionPage() {
  const { usuario } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [board, setBoard] = useState<Board>(BOARD_VACIO)
  const [hover, setHover] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => { setMounted(true) }, [])

  const cargarCitas = async () => {
    try {
      const data = await api.citas.delDia()
      setBoard(citasABoard(data))
    } catch (e) {
      console.error('Error cargando citas:', e)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (!mounted) return
    const token = localStorage.getItem('access_token')
    if (!token) { router.push('/login'); return }
    cargarCitas()
  }, [mounted])

  if (!mounted) return null

  const moverSiguiente = async (cita: Cita) => {
    const siguiente = SIGUIENTE_ESTADO[cita.estado] as EstadoCita
    if (!siguiente) return
    try {
      await api.citas.updateEstado(cita.id, siguiente)
      const sourceCol = [...board[cita.estado]].filter(c => c.id !== cita.id)
      const destCol = [...board[siguiente], { ...cita, estado: siguiente }]
      setBoard({ ...board, [cita.estado]: sourceCol, [siguiente]: destCol })
    } catch (e) {
      console.error('Error actualizando estado:', e)
    }
  }

  const onDragEnd = async (result: DropResult) => {
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
    try {
      await api.citas.updateEstado(moved.id, destCol)
    } catch (e) {
      console.error('Error actualizando estado:', e)
      cargarCitas()
    }
  }

  const totalCitas = Object.values(board).flat().length

  return (
    <div className="min-h-screen bg-[#0A0F0D] flex flex-col">

      {modalAbierto && (
        <ModalAgendarCita
          onClose={() => setModalAbierto(false)}
          onCreada={cargarCitas}
          centroId={CENTRO_ID}
          profesionalId={PROFESIONAL_ID}
        />
      )}

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
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-[#1D9E75] hover:bg-[#25B587] text-white text-base font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            + Nueva cita
          </button>
        </div>
      </header>

      <div className="px-8 py-5 border-b border-white/8 bg-[#0D1410] flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-white text-2xl font-bold">Hoy</h2>
          <span className="text-white/30 text-lg">
            {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
          </span>
        </div>
        <div className="flex items-center gap-6">
          {[
            { value: totalCitas,               label: 'citas hoy',   color: '#fff'    },
            { value: board.CHECK_IN.length,    label: 'en sala',     color: '#AFA9EC' },
            { value: board.EN_ATENCION.length, label: 'en consulta', color: '#FAC775' },
            { value: board.FINALIZADA.length,  label: 'completadas', color: '#97C459' },
            { value: board.NO_SHOW.length,     label: 'no show',     color: '#F09595' },
          ].map(({ value, label, color }, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <div className="w-px h-6 bg-white/10 mr-4" />}
              <span className="text-3xl font-bold" style={{ color }}>{value}</span>
              <span className="text-white/40 text-sm uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        {cargando ? (
          <div className="flex items-center justify-center h-48">
            <span className="text-white/30 text-lg">Cargando citas...</span>
          </div>
        ) : (
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
                          {citas.length === 0 && !snapshot.isDraggingOver && (
                            <div className="text-center py-8 text-white/15 text-sm">Sin citas</div>
                          )}
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
                                    borderLeft: `3px solid ${cita.profesional.color_agenda ?? '#1D9E75'}`,
                                    boxShadow: snap.isDragging ? '0 12px 32px rgba(0,0,0,0.5)' : undefined,
                                    ...prov.draggableProps.style,
                                  }}
                                >
                                  <div className="text-white font-bold text-lg mb-2 leading-tight">
                                    {cita.paciente.nombre} {cita.paciente.apellido}
                                  </div>
                                  <div className="text-white/80 text-base font-medium mb-1">
                                    {cita.profesional.usuario.nombre} {cita.profesional.usuario.apellido}
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
        )}
      </div>
    </div>
  )
}