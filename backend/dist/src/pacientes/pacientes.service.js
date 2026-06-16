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
exports.PacientesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PacientesService = class PacientesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async buscar(q) {
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
        });
    }
    async listar(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [pacientes, total] = await Promise.all([
            this.prisma.paciente.findMany({
                where: { activo: true, deleted_at: null },
                select: { id: true, rut: true, nombre: true, apellido: true, telefono: true, prevision: true, email: true, created_at: true },
                orderBy: { apellido: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.paciente.count({ where: { activo: true, deleted_at: null } }),
        ]);
        return { pacientes, total, page, pages: Math.ceil(total / limit) };
    }
    async getById(id) {
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
        });
        return paciente;
    }
    async actualizar(id, data) {
        return this.prisma.paciente.update({
            where: { id },
            data: {
                ...data,
                ...(data.fecha_nacimiento ? { fecha_nacimiento: new Date(data.fecha_nacimiento) } : {}),
                updated_at: new Date(),
            },
        });
    }
    async crear(data) {
        return this.prisma.paciente.create({
            data: {
                ...data,
                fecha_nacimiento: new Date(data.fecha_nacimiento),
                activo: true,
            },
        });
    }
};
exports.PacientesService = PacientesService;
exports.PacientesService = PacientesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PacientesService);
//# sourceMappingURL=pacientes.service.js.map