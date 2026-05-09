import { Module } from '@nestjs/common';
import { InscripcionModule } from './inscription/inscription.module';
import { UbicacionModule } from './ubicacion/ubicacion.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { NacionalidadesModule } from './nacionalidades/nacionalidades.module';


@Module({
  // 👇 aquí importamos el módulo de inscripción para que esté disponible en toda la aplicación
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InscripcionModule,
    UbicacionModule,
    AuthModule,
    NacionalidadesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
