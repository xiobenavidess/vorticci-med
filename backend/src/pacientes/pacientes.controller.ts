import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pacientes')
@UseGuards(JwtAuthGuard)
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Get()
  listar(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.pacientesService.listar(Number(page ?? 1), Number(limit ?? 20))
  }

  @Get('buscar')
  buscar(@Query('q') q: string) {
    return this.pacientesService.buscar(q ?? '')
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.pacientesService.getById(id)
  }

  @Post()
  crear(@Body() body: any) {
    return this.pacientesService.crear(body)
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() body: any) {
    return this.pacientesService.actualizar(id, body)
  }
}