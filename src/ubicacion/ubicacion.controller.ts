import { Controller, Get, Param } from '@nestjs/common';
import { UbicacionService } from './ubicacion.service';

@Controller()
export class UbicacionController {
  constructor(private readonly ubicacionService: UbicacionService) {}

  @Get('provincias')
  getProvincias() {
    return this.ubicacionService.findProvincias();
  }

  @Get('cantones/:provinciaId')
  getCantones(@Param('provinciaId') provinciaId: string) {
    return this.ubicacionService.findCantones(Number(provinciaId));
  }

  @Get('parroquias/:cantonId')
  getParroquias(@Param('cantonId') cantonId: string) {
    return this.ubicacionService.findParroquias(Number(cantonId));
  }
}