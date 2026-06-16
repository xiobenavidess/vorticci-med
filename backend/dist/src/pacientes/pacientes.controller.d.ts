import { PacientesService } from './pacientes.service';
export declare class PacientesController {
    private readonly pacientesService;
    constructor(pacientesService: PacientesService);
    listar(page?: string, limit?: string): Promise<{
        pacientes: {
            id: string;
            created_at: Date;
            email: string | null;
            nombre: string;
            apellido: string;
            rut: string;
            telefono: string;
            prevision: string | null;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    buscar(q: string): Promise<{
        id: string;
        nombre: string;
        apellido: string;
        rut: string;
        telefono: string;
        prevision: string | null;
    }[]>;
    getById(id: string): Promise<({
        citas: ({
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
        })[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        email: string | null;
        nombre: string;
        apellido: string;
        activo: boolean;
        rut: string;
        telefono: string;
        usuario_id: string | null;
        fecha_nacimiento: Date;
        prevision: string | null;
    }) | null>;
    crear(body: any): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        email: string | null;
        nombre: string;
        apellido: string;
        activo: boolean;
        rut: string;
        telefono: string;
        usuario_id: string | null;
        fecha_nacimiento: Date;
        prevision: string | null;
    }>;
    actualizar(id: string, body: any): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        email: string | null;
        nombre: string;
        apellido: string;
        activo: boolean;
        rut: string;
        telefono: string;
        usuario_id: string | null;
        fecha_nacimiento: Date;
        prevision: string | null;
    }>;
}
