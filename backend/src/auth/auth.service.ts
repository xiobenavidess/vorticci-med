import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email, deleted_at: null },
      include: {
        centro: { select: { id: true, nombre: true } },
      },
    })

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const valid = await bcrypt.compare(password, usuario.password_hash)
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const payload: any = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      centro_id: usuario.centro_id,
    }

    const access_token = this.jwt.sign(payload)

    const refresh_token = randomUUID()

    await this.prisma.refreshToken.create({
      data: {
        usuario_id: usuario.id,
        token: refresh_token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

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
      },
    }
  }

  async refresh(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { usuario: true },
    })

    if (!stored || stored.revoked_at || stored.expires_at < new Date()) {
      throw new UnauthorizedException('Token inválido o expirado')
    }

    const payload: Record<string, unknown> = {
      sub: stored.usuario.id,
      email: stored.usuario.email,
      rol: stored.usuario.rol,
      centro_id: stored.usuario.centro_id,
    }

    const access_token = this.jwt.sign(payload, { expiresIn: '15m' })
    return { access_token }
  }

  async logout(token: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked_at: new Date() },
    })
    return { ok: true }
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 12)
  }
}