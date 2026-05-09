import { Injectable } from '@nestjs/common';
import { CreateNacionalidadeDto } from './dto/create-nacionalidade.dto';
import { UpdateNacionalidadeDto } from './dto/update-nacionalidade.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NacionalidadesService {
  constructor(private prisma: PrismaService) {}



  
  create(createNacionalidadeDto: CreateNacionalidadeDto) {
    return 'This action adds a new nacionalidade';
  }

  findAll() {
    return this.prisma.nacionalidad.findMany({
      orderBy: {
        paisNac: 'asc',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} nacionalidade`;
  }

  update(id: number, updateNacionalidadeDto: UpdateNacionalidadeDto) {
    return `This action updates a #${id} nacionalidade`;
  }

  remove(id: number) {
    return `This action removes a #${id} nacionalidade`;
  }
}
