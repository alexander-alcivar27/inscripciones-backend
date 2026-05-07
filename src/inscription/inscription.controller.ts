import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { InscripcionService } from './inscription.service';
import { CreateInscripcionDto } from './dto/create-dto';

@Controller('inscripciones')
export class InscripcionController {
  //sirve para inyectar el servicio de inscripcion en el controlador, 
  // lo que permite que el controlador pueda utilizar los métodos definidos 
  // en el servicio para manejar las solicitudes HTTP relacionadas con las inscripciones.
  constructor(private readonly service: InscripcionService) { }

  // Define un método para manejar las solicitudes POST a la ruta '/inscripciones'. 
  // Este método recibe un cuerpo de solicitud que debe coincidir con la estructura 
  // definida en CreateInscripcionDto. Luego, llama al método create del servicio de inscripcion para crear una nueva inscripción con los datos proporcionados.
  @Post()
  create(@Body() body: CreateInscripcionDto) {
    console.log('Datos recibidos en el controlador:', body);
    return this.service.create(body);
  }
  // Define un método para manejar las solicitudes GET a la ruta '/inscripciones'.
  //  Este método llama al método findAll del servicio de inscripcion para obtener 
  // una lista de todas las inscripciones registradas.
  @Get()
  findAll() {
    return this.service.findAll();
  }
  // Define un método para manejar las solicitudes GET a la ruta '/inscripciones/cedula/:cedula'.
  //  Este método recibe un parámetro de ruta llamado 'cedula' y llama al método findByCedula
  //  del servicio de inscripcion para buscar una inscripción específica basada en la cédula proporcionada.
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
  //  Este método recibe un parámetro de ruta llamado 'id' y llama al método delete
  //  del servicio de inscripcion para eliminar la inscripción correspondiente al ID proporcionado.
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.service.delete(id);
  }
}