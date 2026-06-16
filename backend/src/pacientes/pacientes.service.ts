import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PacientesService {
  constructor(private prisma: PrismaService) {}

  async buscar(q: string) {
    return this.prisma.paciente.findMany({
      where: {
        activo: true,
        deleted_at: null,
        OR: [
          { rut: { contains: q, mode: 'insensitive' } },
          { nombre: { contains: q, mode: 'insensitive' } },
          { apellido: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: { id: true, rut: true, nombre: true, apellido: true, telefono: true, prevision: true },
    })
  }

  async listar(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [pacientes, total] = await Promise.all([
      this.prisma.paciente.findMany({
        where: { activo: true, deleted_at: null },
        select: { id: true, rut: true, nombre: true, apellido: true, telefono: true, prevision: true, email: true, created_at: true },
        orderBy: { apellido: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.paciente.count({ where: { activo: true, deleted_at: null } }),
    ])
    return { pacientes, total, page, pages: Math.ceil(total / limit) }
  }

  async getById(id: string) {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id },
      include: {
        citas: {
          where: { deleted_at: null },
          include: {
            profesional: { select: { especialidad: true, usuario: { select: { nombre: true, apellido: true } } } },
          },
          orderBy: { fecha_hora: 'desc' },
          take: 20,
        },
      },
    })
    return paciente
  }

  async actualizar(id: string, data: {
    nombre?: string
    apellido?: string
    telefono?: string
    email?: string
    prevision?: string
    fecha_nacimiento?: string
  }) {
    return this.prisma.paciente.update({
      where: { id },
      data: {
        ...data,
        ...(data.fecha_nacimiento ? { fecha_nacimiento: new Date(data.fecha_nacimiento) } : {}),
        updated_at: new Date(),
      },
    })
  }

  async crear(data: { rut: string; nombre: string; apellido: string; fecha_nacimiento: string; telefono: string; email?: string; prevision?: string }) {
    return this.prisma.paciente.create({
      data: {
        ...data,
        fecha_nacimiento: new Date(data.fecha_nacimiento),
        activo: true,
      },
    })
  }
}