import { Module } from '@nestjs/common';
import { InscripcionService } from './inscription.service';
import { InscripcionController } from './inscription.controller';
import { PrismaModule } from '../prisma/prisma.module';

//sirve para importar el modulo de prisma y asi poder usarlo en el servicio de inscripcion, es importante importarlo para que el servicio pueda acceder a la base de datos a traves de prisma
@Module({
  imports: [PrismaModule], // 👈 IMPORTANTE
  controllers: [InscripcionController],
  providers: [InscripcionService],
})
export class InscripcionModule {}