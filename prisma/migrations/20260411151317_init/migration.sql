-- CreateTable
CREATE TABLE "Inscription" (
    "id" SERIAL NOT NULL,
    "cedula" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "provincia" TEXT NOT NULL,
    "canton" TEXT NOT NULL,
    "parroquia" TEXT NOT NULL,
    "barrio" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "discapacidad" BOOLEAN NOT NULL,
    "nivelEducacion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inscription_pkey" PRIMARY KEY ("id")
);
