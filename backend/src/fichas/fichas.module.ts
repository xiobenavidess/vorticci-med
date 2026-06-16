import { Module } from '@nestjs/common';
import { FichasController } from './fichas.controller';
import { FichasService } from './fichas.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FichasController],
  providers: [FichasService],
  exports: [FichasService],
})
export class FichasModule {}
