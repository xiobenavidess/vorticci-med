import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { FichasService } from './fichas.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('fichas')
@UseGuards(JwtAuthGuard)
export class FichasController {
  constructor(private readonly fichasService: FichasService) {}

  @Get('cita/:citaId')
  getOrCreate(@Param('citaId') citaId: string) {
    return this.fichasService.getOrCreateFicha(citaId);
  }

  @Post('cita/:citaId')
  guardar(@Param('citaId') citaId: string, @Body() body: any) {
    return this.fichasService.guardar(citaId, body);
  }

  @Get('paciente/:pacienteId')
  getPorPaciente(@Param('pacienteId') pacienteId: string) {
    return this.fichasService.getPorPaciente(pacienteId);
  }
}
