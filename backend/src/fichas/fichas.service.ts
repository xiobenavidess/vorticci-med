import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FichasService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateFicha(citaId: string) {
    let ficha = await this.prisma.fichaClinica.findUnique({
      where: { cita_id: citaId },
    });
    if (!ficha) {
      const cita = await this.prisma.cita.findUnique({
        where: { id: citaId },
        select: { paciente_id: true, profesional_id: true },
      });
      ficha = await this.prisma.fichaClinica.create({
        data: {
          cita_id: citaId,
          paciente_id: cita!.paciente_id,
          profesional_id: cita!.profesional_id,
        },
      });
    }
    return ficha;
  }

  async guardar(citaId: string, body: any) {
    const { paciente_id, profesional_id, cita_id, id, created_at, updated_at, ...data } = body;
    return this.prisma.fichaClinica.update({
      where: { cita_id: citaId },
      data: { ...data, updated_at: new Date() },
    });
  }

  async getPorPaciente(pacienteId: string) {
    return this.prisma.fichaClinica.findMany({
      where: { paciente_id: pacienteId },
      include: { cita: { select: { fecha_hora: true, motivo: true, folio: true } } },
      orderBy: { created_at: 'desc' },
    });
  }
}
