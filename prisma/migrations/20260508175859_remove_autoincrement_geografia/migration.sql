/*
  Warnings:

  - You are about to drop the column `nombre` on the `Canton` table. All the data in the column will be lost.
  - You are about to drop the column `cantonId` on the `Inscription` table. All the data in the column will be lost.
  - You are about to drop the column `parroquia` on the `Inscription` table. All the data in the column will be lost.
  - You are about to drop the column `provinciaId` on the `Inscription` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Parroquia` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Provincia` table. All the data in the column will be lost.
  - Added the required column `canton` to the `Canton` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parroquiaId` to the `Inscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parroquia` to the `Parroquia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provincia` to the `Provincia` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Inscription" DROP CONSTRAINT "Inscription_cantonId_fkey";

-- DropForeignKey
ALTER TABLE "Inscription" DROP CONSTRAINT "Inscription_provinciaId_fkey";

-- DropIndex
DROP INDEX "Canton_nombre_key";

-- DropIndex
DROP INDEX "Parroquia_nombre_key";

-- DropIndex
DROP INDEX "Provincia_nombre_key";

-- AlterTable
ALTER TABLE "Canton" DROP COLUMN "nombre",
ADD COLUMN     "canton" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Canton_id_seq";

-- AlterTable
ALTER TABLE "Inscription" DROP COLUMN "cantonId",
DROP COLUMN "parroquia",
DROP COLUMN "provinciaId",
ADD COLUMN     "parroquiaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Parroquia" DROP COLUMN "nombre",
ADD COLUMN     "parroquia" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Parroquia_id_seq";

-- AlterTable
ALTER TABLE "Provincia" DROP COLUMN "nombre",
ADD COLUMN     "provincia" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Provincia_id_seq";

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_parroquiaId_fkey" FOREIGN KEY ("parroquiaId") REFERENCES "Parroquia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
