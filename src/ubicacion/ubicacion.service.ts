import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UbicacionService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Obtener todas las provincias
  async findProvincias() {
    return this.prisma.provincia.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  // 🔹 Obtener cantones por provincia
  async findCantones(provinciaId: number) {
    return this.prisma.canton.findMany({
      where: { provinciaId },
      orderBy: { nombre: 'asc' },
    });
  }

  // 🔹 (Opcional) Obtener parroquias por cantón
  async findParroquias(cantonId: number) {
    return this.prisma.parroquia.findMany({
      where: { cantonId },
      orderBy: { nombre: 'asc' },
    });
  }
}