import { Module } from '@nestjs/common';
import { CohortsService } from './cohorts.service';
import { CohortsController } from './cohorts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [CohortsController],
  providers: [CohortsService],
})
export class CohortsModule {}