import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInscripcionDto } from './dto/create-dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InscripcionService {
  // inyectamos el servicio de Prisma para poder interactuar con la base de datos
  constructor(
    private prisma: PrismaService,
    private mailservice: MailService,
  ) { }


  // inscripcion 
  async create(data: any) {


    // 🔍 validar cédula
    const existing = await this.prisma.inscription.findUnique({
      where: { cedula: data.cedula },
    });

    if (existing) {
      throw new BadRequestException({
        message: 'La cedula ya esta registrada',
        field: 'cedula',
      });
    }
    const inscription = await this.prisma.inscription.create({
      data: {
        cedula: data.cedula,

        nombres: data.nombres,

        apellidos: data.apellidos,

        correo: data.correo,

        celular: data.celular,

        fechaNacimiento: new Date(data.fechaNacimiento),

        ocupacion: data.ocupacion,

        institucion: data.institucion,

        parroquiaId: Number(data.parroquiaId),

        barrio: data.barrio,

        genero: data.genero,

        orientacionSexual: data.orientacionSexual,

        nacionalidadId: Number(data.nacionalidadId),

        autoidentificacion: data.autoidentificacion,

        discapacidad: data.discapacidad,

        tipoDiscapacidad: data.tipoDiscapacidad,

        nivelEducacion: data.nivelEducacion,
      },
    });

    // enviar correo
    // enviar correo
    //console.log('📧 Voy a enviar correo a:', inscription.correo);

    const resultadoCorreo =
      await this.mailservice.enviarConfirmacionPreinscripcion(
        inscription.correo,
        inscription.nombres,
      );

    //console.log('📧 Resultado:', resultadoCorreo);

    return {
      message: 'Inscripción guardada correctamente',
      data: inscription,
    };
  }


  // método para obtener todas las inscripciones
  async findAll() {
    return this.prisma.inscription.findMany();
  }
  // método para eliminar una inscripción por su id
  async delete(id: number) {
    return this.prisma.inscription.delete({
      where: { id },
    });
  }
  // método para buscar una inscripción por su cedula
  async findByCedula(cedula: string) {
    const user = await this.prisma.inscription.findUnique({
      where: { cedula },
    });
    return { exists: !!user };
  }
  // método para obtener inscripciones por el nombre de la provincia
  async getReportePorProvincia(provincia: string) {
    const termino = provincia
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const personas = await this.prisma.inscription.findMany({
      select: {
        cedula: true,
        nombres: true,
        apellidos: true,
        correo: true,
        celular: true,
        fechaNacimiento: true,
        ocupacion: true,
        institucion: true,
        barrio: true,
        genero: true,
        orientacionSexual: true,
        autoidentificacion: true,
        discapacidad: true,
        tipoDiscapacidad: true,
        nivelEducacion: true,
        createdAt: true,

        parroquia: {
          select: {
            nombre: true,
            canton: {
              select: {
                nombre: true,
                provincia: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },

        nacionalidad: {
          select: {
            gentilicio: true,
          },
        },
      },
    });

    const formatted = personas.map((p) => ({
      cedula: p.cedula,
      nombres: p.nombres,
      apellidos: p.apellidos,
      correo: p.correo,
      celular: p.celular,
      fechaNacimiento: p.fechaNacimiento,
      ocupacion: p.ocupacion || 'N/A',
      institucion: p.institucion || 'N/A',
      provincia: p.parroquia?.canton?.provincia?.nombre || 'N/A',
      canton: p.parroquia?.canton?.nombre || 'N/A',
      parroquia: p.parroquia?.nombre || 'N/A',
      barrio: p.barrio || 'N/A',
      genero: p.genero,
      orientacionSexual: p.orientacionSexual || 'N/A',
      nacionalidad: p.nacionalidad?.gentilicio || 'N/A',
      autoidentificacion: p.autoidentificacion || 'N/A',
      discapacidad: p.discapacidad,
      tipoDiscapacidad: p.tipoDiscapacidad || null,
      nivelEducacion: p.nivelEducacion,
      createdAt: p.createdAt,
    }));

    const filtrado = formatted.filter((p) => {
      const prov = (p.provincia || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      return prov.includes(termino);
    });

    return {
      total: filtrado.length,
      personas: filtrado,
    };
  }


  async getReporteGeneral() {
    const personas = await this.prisma.inscription.findMany({
      select: {
        cedula: true,
        nombres: true,
        apellidos: true,
        correo: true,
        celular: true,
        fechaNacimiento: true,

        ocupacion: true,
        institucion: true,

        barrio: true,
        genero: true,
        orientacionSexual: true,
        autoidentificacion: true,
        discapacidad: true,
        tipoDiscapacidad: true,
        nivelEducacion: true,
        createdAt: true,

        parroquia: {
          select: {
            nombre: true,
            canton: {
              select: {
                nombre: true,
                provincia: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },

        nacionalidad: {
          select: {
            gentilicio: true,
            paisNac: true,
            iso: true,
          },
        },
      },
    });

    const formatted = personas.map((p) => ({
      cedula: p.cedula,
      nombres: p.nombres,
      apellidos: p.apellidos,
      correo: p.correo,
      celular: p.celular,
      fechaNacimiento: p.fechaNacimiento,

      ocupacion: p.ocupacion || 'N/A',
      institucion: p.institucion || 'N/A',

      provincia: p.parroquia?.canton?.provincia?.nombre || 'N/A',
      canton: p.parroquia?.canton?.nombre || 'N/A',
      parroquia: p.parroquia?.nombre || 'N/A',
      barrio: p.barrio || 'N/A',

      genero: p.genero,
      orientacionSexual: p.orientacionSexual || 'N/A',

      nacionalidad: p.nacionalidad?.gentilicio || 'N/A',

      autoidentificacion: p.autoidentificacion || 'N/A',

      discapacidad: p.discapacidad ? 'Sí' : 'No',
      tipoDiscapacidad: p.tipoDiscapacidad || '—',

      nivelEducacion: p.nivelEducacion,
      createdAt: p.createdAt,
    }));

    return {
      total: formatted.length,
      personas: formatted,
    };
  }
}