import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { AddStudentToCohortDto } from './dto/add-student-to-cohort.dto';
import { UpdateCohortStudentDto } from './dto/update-cohort-student.dto';
import { MailService } from '../mail/mail.service';
import * as XLSX from 'xlsx';

@Injectable()
export class CohortsService {
    constructor(private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    create(data: CreateCohortDto) {
        return this.prisma.cohort.create({
            data,
        });
    }

    async findAll() {
        const cohorts = await this.prisma.cohort.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                students: true,
            },
        });

        return cohorts.map((cohort) => {
            const totalStudents = cohort.students.length;
            const emailsSent = cohort.students.filter((s) => s.emailSent).length;
            const emailsPending = totalStudents - emailsSent;

            return {
                id: cohort.id,
                name: cohort.name,
                description: cohort.description,
                courseName: cohort.courseName,
                moodleUrl: cohort.moodleUrl,
                createdAt: cohort.createdAt,
                updatedAt: cohort.updatedAt,
                totalStudents,
                emailsSent,
                emailsPending,
                status:
                    totalStudents > 0 && emailsPending === 0
                        ? 'COMPLETADO'
                        : totalStudents > 0
                            ? 'ACTIVO'
                            : 'PREPARACION',
            };
        });
    }

    //ver cohorte especifico con sus estudiantes
    async findOne(id: number) {
        const cohort = await this.prisma.cohort.findUnique({
            where: { id },
            include: {
                students: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        inscription: true,
                    },
                },
            },
        });

        if (!cohort) {
            throw new BadRequestException(
                'El cohorte no existe',
            );
        }

        const students = cohort.students.map((student) => ({
            id: student.id,
            cedula: student.cedula,
            nombres: student.nombres,
            apellidos: student.apellidos,
            correo: student.correo,
            celular: student.inscription?.celular ?? null,
            moodleUsername: student.moodleUsername,
            emailSent: student.emailSent,
            emailSentAt: student.emailSentAt,
            createdAt: student.createdAt,
        }));

        const totalStudents = students.length;
        const emailsSent = students.filter((s) => s.emailSent).length;
        const emailsPending = totalStudents - emailsSent;

        return {
            id: cohort.id,
            name: cohort.name,
            description: cohort.description,
            courseName: cohort.courseName,
            moodleUrl: cohort.moodleUrl,
            createdAt: cohort.createdAt,

            summary: {
                totalStudents,
                emailsSent,
                emailsPending,
            },

            students,
        };
    }

    //agregar estudiantes a un cohorte
    async addStudent(cohortId: number, data: AddStudentToCohortDto) {
        const existingStudent = await this.prisma.cohortStudent.findFirst({
            where: {
                cohortId,
                cedula: data.cedula,
            },
        });

        if (existingStudent) {
            throw new BadRequestException('Este estudiante ya existe en este cohorte');
        }

        const inscription = await this.prisma.inscription.findUnique({
            where: {
                cedula: data.cedula,
            },
        });

        return this.prisma.cohortStudent.create({
            data: {
                cohortId,
                inscriptionId: inscription?.id ?? null,
                cedula: data.cedula,
                nombres: data.nombres,
                apellidos: data.apellidos,
                correo: data.correo,
                moodleUsername: data.moodleUsername,
                moodlePassword: data.moodlePassword,
            },
        });
    }
    //eliminar estudiante de un cohorte
    async removeStudent(cohortId: number, studentId: number) {
        const student = await this.prisma.cohortStudent.findFirst({
            where: {
                id: studentId,
                cohortId,
            },
        });

        if (!student) {
            throw new BadRequestException('El estudiante no existe en este cohorte');
        }

        return this.prisma.cohortStudent.delete({
            where: {
                id: studentId,
            },
        });
    }
    //actualizar datos de un estudiante del cohorte, especialmente usuario y contraseña Moodle.
    async updateStudent(
        cohortId: number,
        studentId: number,
        data: UpdateCohortStudentDto,
    ) {
        const student = await this.prisma.cohortStudent.findFirst({
            where: {
                id: studentId,
                cohortId,
            },
        });

        if (!student) {
            throw new BadRequestException('El estudiante no existe en este cohorte');
        }

        return this.prisma.cohortStudent.update({
            where: {
                id: studentId,
            },
            data,
        });
    }
    //eliminar cohorte
    async removeCohort(id: number) {
        const cohort = await this.prisma.cohort.findUnique({
            where: { id },
            include: {
                students: true,
            },
        });

        if (!cohort) {
            throw new BadRequestException('El cohorte no existe');
        }

        await this.prisma.cohortStudent.deleteMany({
            where: {
                cohortId: id,
            },
        });

        return this.prisma.cohort.delete({
            where: { id },
        });
    }
    //envio de correo  individual
    async sendWelcomeEmail(cohortId: number, studentId: number) {
        const student = await this.prisma.cohortStudent.findFirst({
            where: {
                id: studentId,
                cohortId,
            },
            include: {
                cohort: true,
            },
        });

        if (!student) {
            throw new BadRequestException(
                'El estudiante no existe en este cohorte',
            );
        }

        if (!student.correo) {
            throw new BadRequestException(
                'El estudiante no tiene correo registrado',
            );
        }

        if (!student.moodleUsername || !student.moodlePassword) {
            throw new BadRequestException(
                'El estudiante no tiene credenciales Moodle completas',
            );
        }

        const enviado = await this.mailService.sendMoodleAccessEmail({
            to: student.correo,
            nombres: student.nombres,
            moodleUsername: student.moodleUsername,
            moodlePassword: student.moodlePassword,
            moodleUrl: student.cohort.moodleUrl ?? '',
            courseName:
                student.cohort.courseName ??
                'Liderazgo y Participación Ciudadana',
        });

        if (!enviado) {
            throw new BadRequestException(
                'No se pudo enviar el correo',
            );
        }

        return this.prisma.cohortStudent.update({
            where: {
                id: student.id,
            },
            data: {
                emailSent: true,
                emailSentAt: new Date(),
            },
        });
    }

    // enviar correo masivo a todos los del cohorte
    async sendWelcomeEmailsToCohort(cohortId: number) {
        const cohort = await this.prisma.cohort.findUnique({
            where: { id: cohortId },
            include: { students: true },
        });

        if (!cohort) {
            throw new BadRequestException('El cohorte no existe');
        }

        const resultados: {
            studentId: number; 
            nombres: string;
            correo: string | null;
            estado: 'ENVIADO' | 'ERROR' | 'OMITIDO';
            mensaje: string;
        }[] = [];

        // envio de correos por lotes
        const batchSize = 50;

        const pendingStudents = cohort.students.filter(
            (student) => !student.emailSent,
        );

        const omittedStudents = cohort.students.filter(
            (student) => student.emailSent,
        );

        for (const student of omittedStudents) {
            resultados.push({
                studentId: student.id,
                nombres: student.nombres,
                correo: student.correo,
                estado: 'OMITIDO',
                mensaje: 'El correo ya fue enviado anteriormente',
            });
        }

        for (let i = 0; i < pendingStudents.length; i += batchSize) {
            const batch = pendingStudents.slice(i, i + batchSize);

            const batchResults = await Promise.all(
                batch.map(async (student) => {
                    try {
                        await this.sendWelcomeEmail(cohortId, student.id);

                        return {
                            studentId: student.id,
                            nombres: student.nombres,
                            correo: student.correo,
                            estado: 'ENVIADO' as const,
                            mensaje: 'Correo enviado correctamente',
                        };
                    } catch (error: unknown) {
                        return {
                            studentId: student.id,
                            nombres: student.nombres,
                            correo: student.correo,
                            estado: 'ERROR' as const,
                            mensaje:
                                error instanceof Error
                                    ? error.message
                                    : 'Error inesperado enviando correo',
                        };
                    }
                }),
            );

            resultados.push(...batchResults);
        }

        const enviados = resultados.filter((r) => r.estado === 'ENVIADO').length;
        const errores = resultados.filter((r) => r.estado === 'ERROR').length;
        const omitidos = resultados.filter((r) => r.estado === 'OMITIDO').length;

        return {
            cohortId,
            total: cohort.students.length,
            pendientesProcesados: pendingStudents.length,
            enviados,
            errores,
            omitidos,
            resultados,
        };
    }
    //importar eexcel a admin
    async importStudentsFromExcel(
        cohortId: number,
        file: any,
    ) {
        if (!file) {
            throw new BadRequestException('No se envió ningún archivo');
        }

        const cohort = await this.prisma.cohort.findUnique({
            where: { id: cohortId },
        });

        if (!cohort) {
            throw new BadRequestException('El cohorte no existe');
        }

        const workbook = XLSX.read(file.buffer, {
            type: 'buffer',
        });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        let creados = 0;
        let duplicados = 0;
        let errores = 0;

        const resultados: any[] = [];

        for (const row of rows) {
            try {
                const cedula = String(row.cedula ?? '').trim();
                const nombres = String(row.nombres ?? '').trim();
                const apellidos = String(row.apellidos ?? '').trim();
                const correo = String(row.correo ?? '').trim();

                if (!cedula || !nombres || !correo) {
                    errores++;
                    resultados.push({
                        cedula,
                        estado: 'ERROR',
                        mensaje: 'Faltan campos obligatorios: cedula, nombres o correo',
                    });
                    continue;
                }

                const existingStudent = await this.prisma.cohortStudent.findFirst({
                    where: {
                        cohortId,
                        cedula,
                    },
                });

                if (existingStudent) {
                    duplicados++;
                    resultados.push({
                        cedula,
                        nombres,
                        correo,
                        estado: 'DUPLICADO',
                        mensaje: 'El estudiante ya existe en este cohorte',
                    });
                    continue;
                }

                const inscription = await this.prisma.inscription.findUnique({
                    where: { cedula },
                });

                await this.prisma.cohortStudent.create({
                    data: {
                        cohortId,
                        inscriptionId: inscription?.id ?? null,
                        cedula,
                        nombres,
                        apellidos,
                        correo,
                        moodleUsername: cedula,
                        moodlePassword: cedula,
                    },
                });

                creados++;

                resultados.push({
                    cedula,
                    nombres,
                    correo,
                    estado: 'CREADO',
                    mensaje: 'Estudiante importado correctamente',
                });
            } catch (error) {
                errores++;
                resultados.push({
                    estado: 'ERROR',
                    mensaje: error instanceof Error ? error.message : 'Error inesperado',
                });
            }
        }

        return {
            cohortId,
            totalFilas: rows.length,
            creados,
            duplicados,
            errores,
            resultados,
        };
    }
    // dashboard
    async getDashboardSummary() {
        const cohorts = await this.prisma.cohort.findMany({
            include: {
                students: true,
            },
        });

        const totalCohorts = cohorts.length;
        const totalStudents = cohorts.reduce(
            (acc, cohort) => acc + cohort.students.length,
            0,
        );

        const emailsSent = cohorts.reduce(
            (acc, cohort) =>
                acc + cohort.students.filter((s) => s.emailSent).length,
            0,
        );

        const emailsPending = totalStudents - emailsSent;

        return {
            totalCohorts,
            totalStudents,
            emailsSent,
            emailsPending,
        };
    }
}

