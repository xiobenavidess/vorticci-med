import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
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
        };
    }>;
    refresh(body: {
        refresh_token: string;
    }): Promise<{
        access_token: string;
    }>;
    logout(body: {
        refresh_token: string;
    }): Promise<{
        ok: boolean;
    }>;
}
