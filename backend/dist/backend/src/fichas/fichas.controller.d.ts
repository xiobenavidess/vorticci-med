import { FichasService } from './fichas.service';
export declare class FichasController {
    private readonly fichasService;
    constructor(fichasService: FichasService);
    getOrCreate(citaId: string): Promise<{
        id: string;
        cita_id: string;
        paciente_id: string;
        profesional_id: string;
        diagnostico: string | null;
        indicaciones: string | null;
        proximo_control: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    guardar(citaId: string, body: any): Promise<{
        id: string;
        cita_id: string;
        paciente_id: string;
        profesional_id: string;
        diagnostico: string | null;
        indicaciones: string | null;
        proximo_control: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    getPorPaciente(pacienteId: string): Promise<({
        cita: {
            folio: string;
            fecha_hora: Date;
            motivo: string | null;
        };
    } & {
        id: string;
        cita_id: string;
        paciente_id: string;
        profesional_id: string;
        diagnostico: string | null;
        indicaciones: string | null;
        proximo_control: string | null;
        created_at: Date;
        updated_at: Date;
    })[]>;
}
