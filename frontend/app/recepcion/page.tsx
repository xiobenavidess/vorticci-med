'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useAuthStore } from '@/lib/auth.store'
import { api } from '@/lib/api'
import ModalAgendarCita from '@/components/ModalAgendarCita'

const COLUMNAS = [
  { id: 'CREADA',      label: 'Esperando',   accent: '#8B92A5', bg: '#8B92A515' },
  { id: 'CONFIRMADA',  label: 'Confirmados', accent: '#6B9FD4', bg: '#6B9FD415' },
  { id: 'CHECK_IN',    label: 'Check-in',    accent: '#9B8FD4', bg: '#9B8FD415' },
  { id: 'EN_ATENCION', label: 'En atención', accent: '#D4A84B', bg: '#D4A84B15' },
  { id: 'FINALIZADA',  label: 'Finalizados', accent: '#5EA87A', bg: '#5EA87A15' },
  { id: 'NO_SHOW',     label: 'No show',     accent: '#C46A6A', bg: '#C46A6A15' },
]

const SIGUIENTE_ESTADO: Record<string, string> = {
  CREADA: 'CONFIRMADA', CONFIRMADA: 'CHECK_IN',
  CHECK_IN: 'EN_ATENCION', EN_ATENCION: 'FINALIZADA',
}

type EstadoCita = 'CREADA' | 'CONFIRMADA' | 'CHECK_IN' | 'EN_ATENCION' | 'FINALIZADA' | 'NO_SHOW'

interface Cita {
  id: string; folio: string; fecha_hora: string; estado: EstadoCita; motivo?: string; llegada?: string
  paciente: { nombre: string; apellido: string; rut: string }
  profesional: { especialidad: string; color_agenda?: string; usuario: { nombre: string; apellido: string } }
}

type Board = Record<EstadoCita, Cita[]>
const BOARD_VACIO: Board = { CREADA: [], CONFIRMADA: [], CHECK_IN: [], EN_ATENCION: [], FINALIZADA: [], NO_SHOW: [] }

const BG = '#0F1117'; const SURFACE = '#1A1F27'; const CARD = '#222931'
const BORDER = '#3D444D'; const BORDER2 = '#2D333B'
const TEXT1 = '#E6EDF3'; const TEXT2 = '#C8D0D8'; const TEXT3 = '#8B95A0'
const GREEN = '#1D9E75'
const CENTRO_ID = 'a1b2c3d4-0000-0000-0000-000000000001'
const PROFESIONAL_ID = 'b2c3d4e5-0000-0000-0000-000000000002'

function citasABoard(citas: any[]): Board {
  const board: Board = { CREADA: [], CONFIRMADA: [], CHECK_IN: [], EN_ATENCION: [], FINALIZADA: [], NO_SHOW: [] }
  for (const c of citas) {
    const estado = c.estado as EstadoCita
    if (board[estado]) board[estado].push({ id: c.id, folio: c.folio, fecha_hora: c.fecha_hora, estado, motivo: c.motivo, paciente: c.paciente, profesional: { especialidad: c.profesional.especialidad, color_agenda: c.profesional.color_agenda ?? GREEN, usuario: c.profesional.usuario } })
  }
  return board
}

export default function RecepcionPage() {
  const { usuario } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [board, setBoard] = useState<Board>(BOARD_VACIO)
  const [hover, setHover] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [vistaMovil, setVistaMovil] = useState<string>('CONFIRMADA')
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const cargarCitas = async () => {
    try {
      const data = await api.citas.delDia()
      setBoard(citasABoard(data))
    } catch (e) { console.error(e) }
    finally { setCargando(false) }
  }

  useEffect(() => {
    if (!mounted) return
    if (!localStorage.getItem('access_token')) { router.push('/login'); return }
    cargarCitas()
  }, [mounted])

  if (!mounted) return null

  const moverSiguiente = async (cita: Cita) => {
    const siguiente = SIGUIENTE_ESTADO[cita.estado] as EstadoCita
    if (!siguiente) return
    try {
      await api.citas.updateEstado(cita.id, siguiente)
      setBoard(b => ({ ...b, [cita.estado]: b[cita.estado].filter(c => c.id !== cita.id), [siguiente]: [...b[siguiente], { ...cita, estado: siguiente }] }))
    } catch (e) { console.error(e) }
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
    try { await api.citas.updateEstado(moved.id, destCol) }
    catch (e) { console.error(e); cargarCitas() }
  }

  const totalCitas = Object.values(board).flat().length

  const CitaCard = ({ cita, accent, bg, dragging = false }: { cita: Cita; accent: string; bg: string; dragging?: boolean }) => (
    <div
      onMouseEnter={() => setHover(cita.id)}
      onMouseLeave={() => setHover(null)}
      style={{ background: CARD, borderRadius: 10, padding: '14px 16px', border: `1px solid ${BORDER2}`, borderLeft: `3px solid ${accent}`, boxShadow: dragging ? '0 8px 24px rgba(0,0,0,0.4)' : hover === cita.id ? '0 2px 8px rgba(0,0,0,0.3)' : 'none', transition: 'box-shadow 0.15s' }}
    >
      <div style={{ fontSize: 11, color: TEXT3, fontWeight: 600, marginBottom: 6 }}>{cita.folio}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: TEXT1, marginBottom: 4 }}>{cita.paciente.nombre} {cita.paciente.apellido}</div>
      <div style={{ fontSize: 13, color: TEXT2, marginBottom: 4 }}>{cita.profesional.usuario.nombre}<span style={{ color: TEXT3, margin: '0 6px' }}>·</span><span style={{ color: TEXT3 }}>{cita.profesional.especialidad}</span></div>
      {cita.motivo && <div style={{ fontSize: 12, color: TEXT3, marginBottom: 10 }}>{cita.motivo}</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER2}` }}>
        <span style={{ fontSize: 13, color: TEXT3 }}>{new Date(cita.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
        {SIGUIENTE_ESTADO[cita.estado] && (
          <button onClick={(e) => { e.stopPropagation(); moverSiguiente(cita) }} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: bg, color: accent }}>
            → Siguiente
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: BG, display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @media (max-width: 640px) {
          .kanban-desktop { display: none !important; }
          .kanban-mobile { display: block !important; }
          .nav-desktop-items { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .subheader-stats { flex-wrap: wrap; gap: 12px !important; }
          .stat-divider { display: none !important; }
        }
        @media (min-width: 641px) {
          .kanban-desktop { display: block !important; }
          .kanban-mobile { display: none !important; }
          .nav-desktop-items { display: flex !important; }
          .hamburger-btn { display: none !important; }
        }
      `}</style>

      {modalAbierto && <ModalAgendarCita onClose={() => setModalAbierto(false)} onCreada={cargarCitas} centroId={CENTRO_ID} profesionalId={PROFESIONAL_ID} />}

      {/* NAVBAR */}
      <header style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, flexShrink: 0, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: 30, height: 30, background: GREEN, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>V</span>
              </div>
              <span style={{ color: TEXT1, fontWeight: 600, fontSize: 15 }}>Vorticci Med</span>
            </button>
            <div style={{ width: 1, height: 16, background: BORDER }} />
            <span style={{ color: TEXT2, fontSize: 14 }}>Recepción</span>
          </div>

          <div className="nav-desktop-items" style={{ alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN }} />
              <span style={{ color: TEXT2, fontSize: 14 }}>{totalCitas} citas hoy</span>
            </div>
            <button onClick={() => setModalAbierto(true)} style={{ background: GREEN, color: '#fff', fontWeight: 600, fontSize: 14, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>+ Nueva cita</button>
          </div>

          <button className="hamburger-btn" onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5 }}>
            <div style={{ width: 20, height: 2, background: TEXT1, borderRadius: 2, transition: 'all 0.2s', transform: menuAbierto ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <div style={{ width: 20, height: 2, background: TEXT1, borderRadius: 2, opacity: menuAbierto ? 0 : 1 }} />
            <div style={{ width: 20, height: 2, background: TEXT1, borderRadius: 2, transition: 'all 0.2s', transform: menuAbierto ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
        </div>

        {menuAbierto && (
          <div style={{ background: SURFACE, borderTop: `1px solid ${BORDER}`, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ color: TEXT2, fontSize: 14 }}>{totalCitas} citas hoy</div>
            <button onClick={() => { setModalAbierto(true); setMenuAbierto(false) }} style={{ background: GREEN, color: '#fff', fontWeight: 600, fontSize: 15, padding: '12px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>+ Nueva cita</button>
          </div>
        )}

        {/* Subheader stats */}
        <div style={{ background: SURFACE, borderTop: `1px solid ${BORDER}`, padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ color: TEXT1, fontSize: 18, fontWeight: 700 }}>Hoy</span>
            <span style={{ color: TEXT3, fontSize: 14 }}>{new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}</span>
          </div>
          <div className="subheader-stats" style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
            {[
              { value: totalCitas, label: 'citas', color: TEXT1 },
              { value: board.CHECK_IN.length, label: 'en sala', color: '#9B8FD4' },
              { value: board.EN_ATENCION.length, label: 'consulta', color: '#D4A84B' },
              { value: board.FINALIZADA.length, label: 'completadas', color: '#5EA87A' },
              { value: board.NO_SHOW.length, label: 'no show', color: '#C46A6A' },
            ].map(({ value, label, color }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 16, marginRight: 16, borderRight: i < 4 ? `1px solid ${BORDER}` : 'none', flexShrink: 0 }} className={i > 0 ? 'stat-divider' : ''}>
                <span style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: 11, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* MOBILE VIEW — tabs por estado */}
      <div className="kanban-mobile" style={{ flex: 1, display: 'none' }}>
        {/* Tab selector */}
        <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, display: 'flex', overflowX: 'auto', padding: '0 4px' }}>
          {COLUMNAS.map(({ id, label, accent }) => {
            const count = board[id as EstadoCita]?.length ?? 0
            const activo = vistaMovil === id
            return (
              <button key={id} onClick={() => setVistaMovil(id)} style={{ background: 'none', border: 'none', padding: '12px 14px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, borderBottom: activo ? `2px solid ${accent}` : '2px solid transparent', flexShrink: 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: activo ? accent : TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, background: activo ? `${accent}25` : BORDER2, color: activo ? accent : TEXT3, borderRadius: 10, padding: '1px 6px' }}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Cards de la columna activa */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cargando ? (
            <div style={{ textAlign: 'center', color: TEXT3, paddingTop: 40 }}>Cargando...</div>
          ) : (() => {
            const col = COLUMNAS.find(c => c.id === vistaMovil)!
            const citas = board[vistaMovil as EstadoCita] ?? []
            return citas.length === 0
              ? <div style={{ textAlign: 'center', color: TEXT3, paddingTop: 40, fontSize: 14 }}>Sin citas en esta columna</div>
              : citas.map(cita => <CitaCard key={cita.id} cita={cita} accent={col.accent} bg={col.bg} />)
          })()}
        </div>
      </div>

      {/* DESKTOP VIEW — Kanban */}
      <div className="kanban-desktop" style={{ flex: 1, overflowX: 'auto', padding: '20px 24px', display: 'none' }}>
        {cargando ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <span style={{ color: TEXT3, fontSize: 15 }}>Cargando citas...</span>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: 'flex', gap: 12, minWidth: 'max-content', height: '100%' }}>
              {COLUMNAS.map(({ id, label, accent, bg }) => {
                const citas = board[id as EstadoCita] || []
                return (
                  <div key={id} style={{ display: 'flex', flexDirection: 'column', width: 272, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent }}>{label}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: bg, color: accent }}>{citas.length}</span>
                    </div>
                    <Droppable droppableId={id}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 10, padding: 6, minHeight: 80, flex: 1, background: snapshot.isDraggingOver ? bg : 'transparent', border: snapshot.isDraggingOver ? `1px dashed ${accent}40` : '1px solid transparent', transition: 'all 0.15s' }}>
                          {citas.length === 0 && !snapshot.isDraggingOver && <div style={{ textAlign: 'center', padding: '32px 0', color: TEXT2, fontSize: 14 }}>Sin citas</div>}
                          {citas.map((cita, idx) => (
                            <Draggable key={cita.id} draggableId={cita.id} index={idx}>
                              {(prov, snap) => (
                                <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} style={{ ...prov.draggableProps.style }}>
                                  <CitaCard cita={cita} accent={accent} bg={bg} dragging={snap.isDragging} />
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
