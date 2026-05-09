import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NacionalidadesService } from './nacionalidades.service';
import { CreateNacionalidadeDto } from './dto/create-nacionalidade.dto';
import { UpdateNacionalidadeDto } from './dto/update-nacionalidade.dto';

@Controller('nacionalidades')
export class NacionalidadesController {
  constructor(private readonly nacionalidadesService: NacionalidadesService) {}

  @Post()
  create(@Body() createNacionalidadeDto: CreateNacionalidadeDto) {
    return this.nacionalidadesService.create(createNacionalidadeDto);
  }

  @Get()
  findAll() {
    return this.nacionalidadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nacionalidadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNacionalidadeDto: UpdateNacionalidadeDto) {
    return this.nacionalidadesService.update(+id, updateNacionalidadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nacionalidadesService.remove(+id);
  }
}
