/*
  Warnings:

  - You are about to drop the column `canton` on the `Inscription` table. All the data in the column will be lost.
  - You are about to drop the column `provincia` on the `Inscription` table. All the data in the column will be lost.
  - You are about to drop the column `tipoDiscapacidad` on the `Inscription` table. All the data in the column will be lost.
  - You are about to drop the `canton` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `parroquia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `provincia` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cantonId` to the `Inscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provinciaId` to the `Inscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "canton" DROP CONSTRAINT "canton_provinciaId_fkey";

-- DropForeignKey
ALTER TABLE "parroquia" DROP CONSTRAINT "parroquia_cantonId_fkey";

-- AlterTable
ALTER TABLE "Inscription" DROP COLUMN "canton",
DROP COLUMN "provincia",
DROP COLUMN "tipoDiscapacidad",
ADD COLUMN     "autoidentificacion" TEXT,
ADD COLUMN     "cantonId" INTEGER NOT NULL,
ADD COLUMN     "institucion" TEXT,
ADD COLUMN     "ocupacion" TEXT,
ADD COLUMN     "orientacionSexual" TEXT,
ADD COLUMN     "provinciaId" INTEGER NOT NULL,
ALTER COLUMN "celular" DROP NOT NULL,
ALTER COLUMN "barrio" DROP NOT NULL;

-- DropTable
DROP TABLE "canton";

-- DropTable
DROP TABLE "parroquia";

-- DropTable
DROP TABLE "provincia";

-- CreateTable
CREATE TABLE "Provincia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Provincia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Canton" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "provinciaId" INTEGER NOT NULL,

    CONSTRAINT "Canton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parroquia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantonId" INTEGER NOT NULL,

    CONSTRAINT "Parroquia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provincia_nombre_key" ON "Provincia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Canton_nombre_key" ON "Canton"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Parroquia_nombre_key" ON "Parroquia"("nombre");

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "Provincia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_cantonId_fkey" FOREIGN KEY ("cantonId") REFERENCES "Canton"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Canton" ADD CONSTRAINT "Canton_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "Provincia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parroquia" ADD CONSTRAINT "Parroquia_cantonId_fkey" FOREIGN KEY ("cantonId") REFERENCES "Canton"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
