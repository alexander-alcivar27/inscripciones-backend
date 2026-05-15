import { Module } from '@nestjs/common';
import { InscripcionModule } from './inscription/inscription.module';
import { UbicacionModule } from './ubicacion/ubicacion.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { NacionalidadesModule } from './nacionalidades/nacionalidades.module';
import { CohortsModule } from './cohorts/cohorts.module';
import { MailModule } from './mail/mail.module';


@Module({
  // 👇 aquí importamos el módulo de inscripción para que esté disponible en toda la aplicación
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InscripcionModule,
    UbicacionModule,
    AuthModule,
    NacionalidadesModule,
    CohortsModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
