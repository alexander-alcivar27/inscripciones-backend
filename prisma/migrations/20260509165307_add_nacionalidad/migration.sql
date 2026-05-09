/*
  Warnings:

  - You are about to drop the column `nacionalidad` on the `Inscription` table. All the data in the column will be lost.
  - Added the required column `nacionalidadId` to the `Inscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inscription" DROP COLUMN "nacionalidad",
ADD COLUMN     "nacionalidadId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Nacionalidad" (
    "id" SERIAL NOT NULL,
    "pais_nac" TEXT NOT NULL,
    "gentilicio_nac" TEXT NOT NULL,
    "iso_nac" TEXT NOT NULL,

    CONSTRAINT "Nacionalidad_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_nacionalidadId_fkey" FOREIGN KEY ("nacionalidadId") REFERENCES "Nacionalidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
