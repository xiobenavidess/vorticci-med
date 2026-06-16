"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CitasService = class CitasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCitasDelDia(fecha) {
        try {
            const hoy = fecha ? new Date(fecha) : new Date();
            const inicio = new Date(hoy);
            inicio.setHours(0, 0, 0, 0);
            const fin = new Date(hoy);
            fin.setHours(23, 59, 59, 999);
            return await this.prisma.cita.findMany({
                where: { fecha_hora: { gte: inicio, lte: fin }, deleted_at: null },
                include: {
                    paciente: { select: { nombre: true, apellido: true, rut: true, prevision: true } },
                    profesional: { select: { especialidad: true, usuario: { select: { nombre: true, apellido: true } } } },
                },
                orderBy: { fecha_hora: 'asc' },
            });
        }
        catch (e) {
            console.error('ERROR getCitasDelDia:', e);
            throw e;
        }
    }
    async updateEstado(id, estado) {
        return this.prisma.cita.update({
            where: { id },
            data: { estado, updated_at: new Date() },
            include: {
                paciente: { select: { nombre: true, apellido: true, rut: true, prevision: true } },
                profesional: { select: { especialidad: true, usuario: { select: { nombre: true, apellido: true } } } },
            },
        });
    }
    async getCitasPorPaciente(pacienteId) {
        return this.prisma.cita.findMany({
            where: { paciente_id: pacienteId, deleted_at: null },
            include: {
                profesional: { select: { especialidad: true, usuario: { select: { nombre: true, apellido: true } } } },
            },
            orderBy: { fecha_hora: 'desc' },
        });
    }
    async crearCita(data) {
        const count = await this.prisma.cita.count();
        const folio = `VM-${String(count + 1).padStart(3, '0')}`;
        return this.prisma.cita.create({
            data: {
                centro_id: data.centro_id,
                paciente_id: data.paciente_id,
                profesional_id: data.profesional_id,
                fecha_hora: new Date(data.fecha_hora),
                duracion: data.duracion ?? 30,
                motivo: data.motivo,
                folio,
            },
            include: {
                paciente: { select: { nombre: true, apellido: true, rut: true, prevision: true } },
                profesional: { select: { especialidad: true, usuario: { select: { nombre: true, apellido: true } } } },
            },
        });
    }
};
exports.CitasService = CitasService;
exports.CitasService = CitasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CitasService);
//# sourceMappingURL=citas.service.js.map