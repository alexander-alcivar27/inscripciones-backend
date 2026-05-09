import { PartialType } from '@nestjs/mapped-types';
import { CreateNacionalidadeDto } from './create-nacionalidade.dto';

export class UpdateNacionalidadeDto extends PartialType(CreateNacionalidadeDto) {}
