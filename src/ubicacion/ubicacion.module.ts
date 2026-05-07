import { Module } from '@nestjs/common';
import { UbicacionController } from './ubicacion.controller';
import { UbicacionService } from './ubicacion.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [UbicacionController],
  providers: [UbicacionService, PrismaService],
})
export class UbicacionModule {}