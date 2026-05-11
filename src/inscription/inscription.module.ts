import { Module } from '@nestjs/common';
import { InscripcionService } from './inscription.service';
import { InscripcionController } from './inscription.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
//sirve para importar el modulo de prisma y asi poder usarlo en el servicio de inscripcion, es importante importarlo para que el servicio pueda acceder a la base de datos a traves de prisma
@Module({
  imports: [PrismaModule], // 👈 IMPORTANTE
  controllers: [InscripcionController],
  providers: [InscripcionService, PrismaService, MailService],
})
export class InscripcionModule {}