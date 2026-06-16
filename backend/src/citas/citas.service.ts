import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoCita } from '@prisma/client';

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService) {}

  async getCitasDelDia(fecha?: string) {
    try {
      const hoy = fecha ? new Date(fecha) : new Date()
      const inicio = new Date(hoy); inicio.setHours(0, 0, 0, 0)
      const fin    = new Date(hoy); fin.setHours(23, 59, 59, 999)

      return await this.prisma.cita.findMany({
        where: { fecha_hora: { gte: inicio, lte: fin }, deleted_at: null },
        include: {
          paciente:    { select: { nombre: true, apellido: true, rut: true, prevision: true } },
          profesional: { select: { especialidad: true, usuario: { select: { nombre: true, apellido: true } } } },
        },
        orderBy: { fecha_hora: 'asc' },
      })
    } catch (e) {
      console.error('ERROR getCitasDelDia:', e)
      throw e
    }
  }

  async updateEstado(id: string, estado: EstadoCita) {
    return this.prisma.cita.update({
      where: { id },
      data:  { estado, updated_at: new Date() },
      include: {
        paciente:    { select: { nombre: true, apellido: true, rut: true, prevision: true } },
        profesional: { select: { especialidad: true, usuario: { select: { nombre: true, apellido: true } } } },
      },
    });
  }

  async getCitasPorPaciente(pacienteId: string) {
    return this.prisma.cita.findMany({
      where: { paciente_id: pacienteId, deleted_at: null },
      include: {
        profesional: { select: { especialidad: true, usuario: { select: { nombre: true, apellido: true } } } },
      },
      orderBy: { fecha_hora: 'desc' },
    });
  }

  async crearCita(data: {
    centro_id: string
    paciente_id: string
    profesional_id: string
    fecha_hora: string
    duracion?: number
    motivo?: string
  }) {
    const count = await this.prisma.cita.count()
    const folio = `VM-${String(count + 1).padStart(3, '0')}`
    return this.prisma.cita.create({
      data: {
        centro_id:      data.centro_id,
        paciente_id:    data.paciente_id,
        profesional_id: data.profesional_id,
        fecha_hora:     new Date(data.fecha_hora),
        duracion:       data.duracion ?? 30,
        motivo:         data.motivo,
        folio,
      },
      include: {
        paciente:    { select: { nombre: true, apellido: true, rut: true, prevision: true } },
        profesional: { select: { especialidad: true, usuario: { select: { nombre: true, apellido: true } } } },
      },
    })
  }
}