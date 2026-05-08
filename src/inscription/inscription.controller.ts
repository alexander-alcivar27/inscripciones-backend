import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { InscripcionService } from './inscription.service';
import { CreateInscripcionDto } from './dto/create-dto';

@Controller('inscripciones')
export class InscripcionController {
 
  constructor(private readonly service: InscripcionService) { }

  // Define un método para manejar las solicitudes POST a la ruta '/inscripciones'. 
  @Post()
  create(@Body() body: CreateInscripcionDto) {
    console.log('Datos recibidos en el controlador:', body);
    return this.service.create(body);
  }
  // Define un método para manejar las solicitudes GET a la ruta '/inscripciones'.
  @Get()
  findAll() {
    return this.service.findAll();
  }
  // Define un método para manejar las solicitudes GET a la ruta '/inscripciones/cedula/:cedula'.
  @Get('cedula/:cedula')
  findByCedula(@Param('cedula') cedula: string) {
    return this.service.findByCedula(cedula);
  }

  // Define un método para manejar las solicitudes GET a la ruta '/inscripciones/reporte/canton/:nombre'.
  @Get('reporte/canton/:nombre')
  getPorCanton(@Param('nombre') nombre: string) {
    return this.service.getPorCanton(nombre);
  }

  // Define un método para manejar las solicitudes GET a la ruta '/inscripciones/reporte/provincia/:nombre'.
  @Get('reporte/provincia/:nombre')
  getPorProvincia(@Param('nombre') nombre: string) {
    return this.service.getPorProvincia(nombre);
  }
  @Get('reporte')
getReporteGeneral() {
  return this.service.getReporteGeneral();
}

  // Define un método para manejar las solicitudes DELETE a la ruta '/inscripciones/:id'.
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}