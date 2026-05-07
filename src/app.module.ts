import { Module } from '@nestjs/common';
import { InscripcionModule } from './inscription/inscription.module';
import { UbicacionModule } from './ubicacion/ubicacion.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';


@Module({
  // 👇 aquí importamos el módulo de inscripción para que esté disponible en toda la aplicación
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 👈 esto hace que las variables de entorno estén disponibles en toda la aplicació n
    InscripcionModule,
    UbicacionModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
