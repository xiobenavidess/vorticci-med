import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password_hash = await bcrypt.hash('paciente123', 12)

  const usuario = await prisma.usuario.create({
    data: {
      email: 'paciente@vorticci.com',
      password_hash,
      nombre: 'María',
      apellido: 'González',
      rol: 'PACIENTE' as any,
      activo: true,
    },
  })

  const paciente = await prisma.paciente.create({
    data: {
      rut: '12.345.678-9',
      nombre: 'María',
      apellido: 'González',
      fecha_nacimiento: new Date('1990-05-15'),
      telefono: '+56912345678',
      email: 'paciente@vorticci.com',
      prevision: 'FONASA',
      usuario_id: usuario.id,
      activo: true,
    },
  })

  console.log('✅ Usuario:', usuario.email)
  console.log('✅ Paciente:', paciente.rut)
  console.log('🔑 Password: paciente123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
