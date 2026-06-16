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
exports.FichasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FichasService = class FichasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateFicha(citaId) {
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
                    paciente_id: cita.paciente_id,
                    profesional_id: cita.profesional_id,
                },
            });
        }
        return ficha;
    }
    async guardar(citaId, body) {
        const { paciente_id, profesional_id, cita_id, id, created_at, updated_at, ...data } = body;
        const cita = await this.prisma.cita.findUnique({
            where: { id: citaId },
            select: { paciente_id: true, profesional_id: true },
        });
        return this.prisma.fichaClinica.upsert({
            where: { cita_id: citaId },
            update: { ...data, updated_at: new Date() },
            create: {
                cita_id: citaId,
                paciente_id: cita.paciente_id,
                profesional_id: cita.profesional_id,
                ...data,
            },
        });
    }
    async getPorPaciente(pacienteId) {
        return this.prisma.fichaClinica.findMany({
            where: { paciente_id: pacienteId },
            include: { cita: { select: { fecha_hora: true, motivo: true, folio: true } } },
            orderBy: { created_at: 'desc' },
        });
    }
};
exports.FichasService = FichasService;
exports.FichasService = FichasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FichasService);
//# sourceMappingURL=fichas.service.js.map