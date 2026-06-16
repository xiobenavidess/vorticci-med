import { Controller, Get, Patch, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CitasService } from './citas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EstadoCita } from '@prisma/client';

@Controller('citas')
@UseGuards(JwtAuthGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Get('dia')
  getCitasDelDia(@Query('fecha') fecha?: string) {
    return this.citasService.getCitasDelDia(fecha);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body('estado') estado: EstadoCita) {
    return this.citasService.updateEstado(id, estado);
  }

  @Get('paciente/:id')
  getCitasPorPaciente(@Param('id') id: string) {
    return this.citasService.getCitasPorPaciente(id);
  }

  @Post()
  crearCita(@Body() body: any) {
    return this.citasService.crearCita(body);
  }
}