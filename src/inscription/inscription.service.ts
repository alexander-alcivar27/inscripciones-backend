import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInscripcionDto } from './dto/create-dto';

@Injectable()
export class InscripcionService {
  // inyectamos el servicio de Prisma para poder interactuar con la base de datos
  constructor(private prisma: PrismaService) { }

  // método para crear una nueva inscripción
  async create(data: CreateInscripcionDto) {

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

    const saved = await this.prisma.inscription.create({
      data: {
        cedula: data.cedula,
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
        celular: data.celular,

        fechaNacimiento: new Date(data.fechaNacimiento),

        ocupacion: data.ocupacion,
        institucion: data.institucion,
        parroquiaId: Number(data.parroquia),
        barrio: data.barrio,

        genero: data.genero,
        orientacionSexual: data.orientacionSexual,
        nacionalidadId: Number(data.nacionalidad),
        autoidentificacion: data.autoidentificacion,

        discapacidad: data.discapacidad,
        tipoDiscapacidad: data.tipoDiscapacidad,
        nivelEducacion: data.nivelEducacion,
      },
    });

    return {
      message: 'Matriculado correctamente',
      data: saved,
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
/*   // método para obtener inscripciones por el nombre de la provincia
  async getPorProvincia(nombre: string) {
    const personas = await this.prisma.inscription.findMany({
      where: {
        provincia: {
          nombre: {
            contains: nombre,
            mode: 'insensitive', // Ignorar mayúsculas/minúsculas
          },
        },
      },
      select: {
        cedula: true,
        nombres: true,
        apellidos: true,
        correo: true,
        celular: true,
        fechaNacimiento: true,
        ocupacion: true,
        institucion: true,
      
        parroquia: true,
        barrio: true,
        genero: true,
        orientacionSexual: true,
        nacionalidad: true,
        autoidentificacion: true,
        discapacidad: true,
        tipoDiscapacidad: true,
        nivelEducacion: true,
        createdAt: true,

        // 🔥 RELACIONES (AQUÍ ESTÁ LA CLAVE)
        canton: {
          select: {
            nombre: true
          }
        },
        provincia: {
          select: {
            nombre: true
          }
        }
      },
    });
        const formatted = personas.map(p => ({
          ...p,
          provincia: p.provincia?.nombre,
          canton: p.canton?.nombre,
        }));

    return {
      total: formatted.length,
      personas: formatted,
    };
   
  } */

  // método para obtener inscripciones por el nombre del cantón
/*   async getPorCanton(nombre: string) {
    const personas = await this.prisma.inscription.findMany({
      where: {
        canton: {
          nombre: {
            contains: nombre,
            mode: 'insensitive', // Ignorar mayúsculas/minúsculas
          },
        },
      },
      select: {
        cedula: true,
        nombres: true,
        apellidos: true,
        correo: true,
        celular: true,
      },
    });

    return {
      total: personas.length,
      personas,
    };
  } */
  // método para obtener un reporte general de todas las inscripciones con detalles de provincia y cantón
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

        parroquia: true,
        barrio: true,

        genero: true,
        orientacionSexual: true,
        nacionalidad: true,
        autoidentificacion: true,

        discapacidad: true,
        tipoDiscapacidad: true,

        nivelEducacion: true,
        createdAt: true,

        // RELACIONES 
        // parroquia: {
        //   select: {
        //     nombre: true
        //   }
        // },
        // provincia: {
        //   select: {
        //     nombre: true
        //   }
        // }
      }
    });

    // formatear datos para incluir nombres de provincia y cantón
    const formatted = personas.map(p => ({
      cedula: p.cedula,
      nombres: p.nombres,
      apellidos: p.apellidos,
      correo: p.correo,
      celular: p.celular,
      fechaNacimiento: p.fechaNacimiento,
      ocupacion: p.ocupacion,
      institucion: p.institucion,

      // provincia: p.provincia?.nombre,
      // canton: p.canton?.nombre,
      parroquia: p.parroquia,
      barrio: p.barrio,

      genero: p.genero,
      orientacionSexual: p.orientacionSexual,
      nacionalidad: p.nacionalidad,
      autoidentificacion: p.autoidentificacion,

      discapacidad: p.discapacidad,
      tipoDiscapacidad: p.tipoDiscapacidad || null,

      nivelEducacion: p.nivelEducacion,
      createdAt: p.createdAt,
    }));

    return {
      total: formatted.length,
      personas: formatted
    };
  }



}