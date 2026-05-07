/*
  Warnings:

  - A unique constraint covering the columns `[cedula]` on the table `Inscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Inscription" ADD COLUMN     "tipoDiscapacidad" TEXT;

-- CreateTable
CREATE TABLE "provincia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "provincia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canton" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "provinciaId" INTEGER NOT NULL,

    CONSTRAINT "canton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parroquia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantonId" INTEGER NOT NULL,

    CONSTRAINT "parroquia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provincia_nombre_key" ON "provincia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "canton_nombre_key" ON "canton"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "parroquia_nombre_key" ON "parroquia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Inscription_cedula_key" ON "Inscription"("cedula");

-- AddForeignKey
ALTER TABLE "canton" ADD CONSTRAINT "canton_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "provincia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parroquia" ADD CONSTRAINT "parroquia_cantonId_fkey" FOREIGN KEY ("cantonId") REFERENCES "canton"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
