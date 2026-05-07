import { IsString, IsEmail, IsBoolean, IsDateString, isString } from 'class-validator';

export class CreateInscripcionDto {
  @IsString()
  cedula!: string;

  @IsString()
  nombres!: string;

  @IsString()
  apellidos!: string;

  @IsEmail()
  correo!: string;

  @IsString()
  celular!: string;

  @IsDateString()
  fechaNacimiento!: string;

  @IsString()
  ocupacion!: string;
  @IsString()
  institucion!: string;

  @IsString()
  provinciaId!: string;

  @IsString()
  cantonId!: string;

  @IsString()
  parroquia!: string;

  @IsString()
  barrio!: string;

  @IsString()
  genero!: string;

  @IsString()
  orientacionSexual!: string;


  @IsString()
  nacionalidad!: string;

  @IsString()
  autoidentificacion!: string;

  @IsBoolean()
  discapacidad!: boolean;

  @IsString()
  tipoDiscapacidad!: string;

  @IsString()
  nivelEducacion!: string;
}