import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(email: string, password: string): Promise<{
        access_token: string;
        refresh_token: `${string}-${string}-${string}-${string}-${string}`;
        usuario: {
            id: string;
            nombre: string;
            apellido: string;
            email: string;
            rol: import(".prisma/client").$Enums.Rol;
            centro: {
                id: string;
                nombre: string;
            } | null;
            paciente_id: string | null;
        };
    }>;
    refresh(token: string): Promise<{
        access_token: string;
    }>;
    logout(token: string): Promise<{
        ok: boolean;
    }>;
    hashPassword(password: string): Promise<string>;
}
