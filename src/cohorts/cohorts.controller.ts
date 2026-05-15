import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CohortsService } from './cohorts.service';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { AddStudentToCohortDto } from './dto/add-student-to-cohort.dto';
import { UpdateCohortStudentDto } from './dto/update-cohort-student.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('cohorts')
export class CohortsController {
  constructor(private readonly cohortsService: CohortsService) { }

  @Post()
  create(@Body() body: CreateCohortDto) {
    return this.cohortsService.create(body);
  }

  @Get()
  findAll() {
    return this.cohortsService.findAll();
  }

  //ver estudiantes en cohortes
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cohortsService.findOne(Number(id));
  }

  //agregar estudiantes a cohorte
  @Post(':id/students')
  addStudent(
    @Param('id') id: string,
    @Body() body: AddStudentToCohortDto,
  ) {
    return this.cohortsService.addStudent(Number(id), body);
  }
  //eliminar estudiante de cohorte
  @Delete(':cohortId/students/:studentId')
  removeStudent(
    @Param('cohortId') cohortId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.cohortsService.removeStudent(Number(cohortId), Number(studentId));
  }
  //eliminar cohorte
  @Delete(':id')
  removeCohort(@Param('id') id: string) {
    return this.cohortsService.removeCohort(Number(id));
  }

  //actualizar datos de un estudiante
  @Patch(':cohortId/students/:studentId')
  updateStudent(
    @Param('cohortId') cohortId: string,
    @Param('studentId') studentId: string,
    @Body() body: UpdateCohortStudentDto,
  ) {
    return this.cohortsService.updateStudent(
      Number(cohortId),
      Number(studentId),
      body,
    );
  }

  //enviar correo a los del cohorte
  @Post(':cohortId/send-welcome-emails')
  sendWelcomeEmailsToCohort(@Param('cohortId') cohortId: string) {
    return this.cohortsService.sendWelcomeEmailsToCohort(Number(cohortId));
  }

  //inportar excel a admin
  @Post(':cohortId/import-students')
  @UseInterceptors(FileInterceptor('file'))
  importStudents(
    @Param('cohortId') cohortId: string,
    @UploadedFile() file: any,
  ) {
    return this.cohortsService.importStudentsFromExcel(
      Number(cohortId),
      file,
    );
  }

  // dashboard
  @Get('dashboard/summary')
  getDashboardSummary() {
    return this.cohortsService.getDashboardSummary();
  }
}