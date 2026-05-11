import { Module } from '@nestjs/common';
import { InscripcionService } from './inscription.service';
import { InscripcionController } from './inscription.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [PrismaModule],
  controllers: [InscripcionController],
  providers: [InscripcionService, MailService],
})
export class InscripcionModule {}