import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CitasModule } from './citas/citas.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { FichasModule } from './fichas/fichas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CitasModule,
    PacientesModule,
    FichasModule,
  ],
})
export class AppModule {}