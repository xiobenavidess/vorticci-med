"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async login(email, password) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { email, deleted_at: null },
            include: {
                centro: { select: { id: true, nombre: true } },
                paciente: { select: { id: true } },
            },
        });
        if (!usuario || !usuario.activo) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const valid = await bcrypt.compare(password, usuario.password_hash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            rol: usuario.rol,
            centro_id: usuario.centro_id,
        };
        const access_token = this.jwt.sign(payload);
        const refresh_token = (0, crypto_1.randomUUID)();
        await this.prisma.refreshToken.create({
            data: {
                usuario_id: usuario.id,
                token: refresh_token,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            access_token,
            refresh_token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                rol: usuario.rol,
                centro: usuario.centro,
                paciente_id: usuario.paciente?.id ?? null,
            },
        };
    }
    async refresh(token) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token },
            include: { usuario: true },
        });
        if (!stored || stored.revoked_at || stored.expires_at < new Date()) {
            throw new common_1.UnauthorizedException('Token inválido o expirado');
        }
        const payload = {
            sub: stored.usuario.id,
            email: stored.usuario.email,
            rol: stored.usuario.rol,
            centro_id: stored.usuario.centro_id,
        };
        const access_token = this.jwt.sign(payload, { expiresIn: '15m' });
        return { access_token };
    }
    async logout(token) {
        await this.prisma.refreshToken.updateMany({
            where: { token },
            data: { revoked_at: new Date() },
        });
        return { ok: true };
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 12);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map