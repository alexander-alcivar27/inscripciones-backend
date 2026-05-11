//servicio de envio de correo
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor() {
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  }

  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async enviarConfirmacionPreinscripcion(correo: string, nombres: string) {
    try {

      console.log('📨 Intentando enviar correo a:', correo);

      const info = await this.transporter.sendMail({
        from: `"Escuela de Formación Ciudadana" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: 'Confirmación de preinscripción',
        html: `
          <div style="font-family: Arial, sans-serif; color:#0b2545;">
            <h2 style="color:#0f9d8a;">Preinscripción guardada correctamente</h2>
            <p>Hola ${nombres},</p>
            <p>Tu preinscripción ha sido registrada exitosamente.</p>
            <p>Te enviaremos más información sobre el inicio del curso.</p>
            <br>
            <p>Gracias por formar parte de la Escuela de Formación Ciudadana y Liderazgo Territorial.</p>
          </div>
        `,
      });

      console.log('✅ Correo enviado correctamente');
      console.log('📩 Message ID:', info.messageId);

      return true;

    } catch (error: unknown) {

      console.log('❌ ERROR REAL');
      console.log(error);

      if (error instanceof Error) {
        this.logger.error(
          'Error enviando correo de confirmación',
          error.stack,  // me daba error en error?.stack, me decia que stack no existia
        );
      } else {
        this.logger.error(
          'Error enviando correo de confirmación',
          String(error),
        );
      }

      return false;
    }
  }
}