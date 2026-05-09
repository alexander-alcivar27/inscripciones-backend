import { Module } from '@nestjs/common';
import { NacionalidadesService } from './nacionalidades.service';
import { NacionalidadesController } from './nacionalidades.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
   imports: [PrismaModule],
  controllers: [NacionalidadesController],
  providers: [NacionalidadesService],
})
export class NacionalidadesModule {}
