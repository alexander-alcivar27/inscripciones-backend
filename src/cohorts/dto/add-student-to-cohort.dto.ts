export class AddStudentToCohortDto {
    inscriptionId?: number;

    cedula!: string;
    nombres!: string;
    apellidos?: string;
    correo?: string;

    moodleUsername!: string;
    moodlePassword?: string;
}