import { PrismaService } from '../prisma/prisma.service';
import { EstadoCita } from '@prisma/client';
export declare class CitasService {
    private prisma;
    constructor(prisma: PrismaService);
    getCitasDelDia(fecha?: string): Promise<({
        paciente: {
            nombre: string;
            apellido: string;
            rut: string;
            prevision: string | null;
        };
        profesional: {
            usuario: {
                nombre: string;
                apellido: string;
            };
            especialidad: string;
        };
    } & {
        id: string;
        paciente_id: string;
        profesional_id: string;
        created_at: Date;
        updated_at: Date;
        folio: string;
        centro_id: string;
        fecha_hora: Date;
        duracion: number;
        estado: import(".prisma/client").$Enums.EstadoCita;
        motivo: string | null;
        deleted_at: Date | null;
    })[]>;
    updateEstado(id: string, estado: EstadoCita): Promise<{
        paciente: {
            nombre: string;
            apellido: string;
            rut: string;
            prevision: string | null;
        };
        profesional: {
            usuario: {
                nombre: string;
                apellido: string;
            };
            especialidad: string;
        };
    } & {
        id: string;
        paciente_id: string;
        profesional_id: string;
        created_at: Date;
        updated_at: Date;
        folio: string;
        centro_id: string;
        fecha_hora: Date;
        duracion: number;
        estado: import(".prisma/client").$Enums.EstadoCita;
        motivo: string | null;
        deleted_at: Date | null;
    }>;
    getCitasPorPaciente(pacienteId: string): Promise<({
        profesional: {
            usuario: {
                nombre: string;
                apellido: string;
            };
            especialidad: string;
        };
    } & {
        id: string;
        paciente_id: string;
        profesional_id: string;
        created_at: Date;
        updated_at: Date;
        folio: string;
        centro_id: string;
        fecha_hora: Date;
        duracion: number;
        estado: import(".prisma/client").$Enums.EstadoCita;
        motivo: string | null;
        deleted_at: Date | null;
    })[]>;
    crearCita(data: {
        centro_id: string;
        paciente_id: string;
        profesional_id: string;
        fecha_hora: string;
        duracion?: number;
        motivo?: string;
    }): Promise<{
        paciente: {
            nombre: string;
            apellido: string;
            rut: string;
            prevision: string | null;
        };
        profesional: {
            usuario: {
                nombre: string;
                apellido: string;
            };
            especialidad: string;
        };
    } & {
        id: string;
        paciente_id: string;
        profesional_id: string;
        created_at: Date;
        updated_at: Date;
        folio: string;
        centro_id: string;
        fecha_hora: Date;
        duracion: number;
        estado: import(".prisma/client").$Enums.EstadoCita;
        motivo: string | null;
        deleted_at: Date | null;
    }>;
}
