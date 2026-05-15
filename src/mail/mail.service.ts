//servicio de envio de correo
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
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
  
// envio de correo de confirmacion de preinscripcion
  async enviarConfirmacionPreinscripcion(correo: string, nombres: string) {
    try {

      console.log('📨 Intentando enviar correo a:', correo);

      const info = await this.transporter.sendMail({
        from: `"Escuela de Formación Ciudadana" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: 'Confirmación de preinscripción',
        html: `

        <div style="margin:0;padding:0;background:#f4f6f5;font-family:Arial,Helvetica,sans-serif;color:#1b1b1b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f4f6f5;padding:24px 0;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:0 12px;">

        <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:680px;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 12px 35px rgba(0,0,0,0.08);border-collapse:collapse;">

          <!-- Hero -->
          <tr>
            <td style="background:#00AA99;padding:0;">
              <img 
                src="https://cacicustech.com/capacitate_manabi/assets/banner-correo-01.jpg" 
                alt="Escuela de Formación Ciudadana y Liderazgo Territorial" 
                width="680"
                style="width:100%;max-width:680px;height:auto;display:block;border:0;outline:none;text-decoration:none;"
              >
            </td>
          </tr>

          <!-- Main message -->
          <tr>
            <td style="padding:36px 42px;text-align:center;">
              <h1 style="margin:0;color:#00AA99;font-size:28px;line-height:1.2;font-weight:700;letter-spacing:-0.5px;">
                ¡Hola, ${nombres}! 👋
              </h1>

              <p style="font-size:17px;line-height:1.7;margin:22px 0 12px;color:#374151;">
                Tu preinscripción en la 
                <strong style="color:#00AA99;">Escuela de Formación Ciudadana y Liderazgo Territorial</strong>
                ha sido 
                <strong style="color:#0F9D58;">registrada exitosamente</strong>.
              </p>

              <p style="font-size:16px;line-height:1.7;margin:0;color:#5B6470;">
                Gracias por dar este importante paso hacia el fortalecimiento de tus conocimientos,
                liderazgo y participación ciudadana.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#00AA99;padding:0;">
              <img 
                src="https://cacicustech.com/capacitate_manabi/assets/fotter-correo-02.jpg" 
                alt="Información de contacto de la Escuela" 
                width="680"
                style="width:100%;max-width:680px;height:auto;display:block;border:0;outline:none;text-decoration:none;"
              >
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
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

  //enviar correo de bienvenida al curso
  async sendMoodleAccessEmail(data: {
    to: string;
    nombres: string;
    moodleUsername: string;
    moodlePassword: string;
    moodleUrl: string;
    courseName: string;
  }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Escuela de Formación Ciudadana" <${process.env.EMAIL_USER}>`,
        to: data.to,
        subject: 'Ya puedes iniciar tu curso virtual',
        html: `
        <div style="margin:0;padding:0;background:#f4f6f5;font-family:Arial,Helvetica,sans-serif;color:#1b1b1b;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f4f6f5;padding:24px 0;border-collapse:collapse;">
            <tr>
              <td align="center" style="padding:0 12px;">

                <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:680px;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 12px 35px rgba(0,0,0,0.08);border-collapse:collapse;">

                  <tr>
                    <td style="background:#00AA99;padding:0;">
                      <img 
                        src="https://cacicustech.com/capacitate_manabi/assets/header_02_escuelas.jpg" 
                        alt="Escuela de Formación Ciudadana y Liderazgo Territorial" 
                        width="680"
                        style="width:100%;max-width:680px;height:auto;display:block;border:0;outline:none;text-decoration:none;"
                      >
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:36px 42px;text-align:center;">
                      <h1 style="margin:0;color:#00AA99;font-size:28px;line-height:1.2;font-weight:700;">
                        ¡Hola, ${data.nombres}! 👋
                      </h1>

                      <p style="font-size:17px;line-height:1.7;margin:22px 0 12px;color:#374151;">
                        Ya estás inscrito en el curso:
                        <br>
                        <strong style="color:#00AA99;">${data.courseName}</strong>
                      </p>

                      <p style="font-size:16px;line-height:1.7;margin:0 0 24px;color:#5B6470;">
                        Ahora puedes ingresar a la plataforma virtual Moodle y comenzar tu proceso de formación.
                      </p>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;margin:0 auto 28px;border-collapse:separate;">
                        <tr>
                          <td style="padding:22px;text-align:left;">
                            <p style="margin:0 0 12px;font-size:16px;color:#374151;">
                              <strong>Usuario:</strong> ${data.moodleUsername}
                            </p>
                            <p style="margin:0;font-size:16px;color:#374151;">
                              <strong>Contraseña:</strong> ${data.moodlePassword}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <a href="${data.moodleUrl}" 
                        style="display:inline-block;background:#00AA99;color:#ffffff;text-decoration:none;padding:15px 28px;border-radius:999px;font-weight:700;font-size:16px;">
                        Iniciar sesión en Moodle
                      </a>

                      <p style="font-size:14px;line-height:1.6;margin:24px 0 0;color:#6b7280;">
                        Te recomendamos cambiar tu contraseña después del primer ingreso y avanzar en cada módulo hasta completar todas las actividades.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="background:#00AA99;padding:0;">
                      <img 
                        src="https://cacicustech.com/capacitate_manabi/assets/fotter-correo-02.jpg" 
                        alt="Información de contacto de la Escuela" 
                        width="680"
                        style="width:100%;max-width:680px;height:auto;display:block;border:0;outline:none;text-decoration:none;"
                      >
                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>
        </div>
      `,
      });

      this.logger.log(`Correo de acceso Moodle enviado: ${info.messageId}`);
      return true;

    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          'Error enviando correo de acceso Moodle',
          error.stack,
        );
      } else {
        this.logger.error(
          'Error enviando correo de acceso Moodle',
          String(error),
        );
      }

      return false;
    }
  }
}