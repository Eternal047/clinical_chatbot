/*
  Warnings:

  - You are about to drop the column `pacienteId` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the `pacientes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `medicos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pacienteDni` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pacienteNombre` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pacienteTelef` to the `citas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "EstadoCita" ADD VALUE 'FINALIZADO';

-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "horarios" DROP CONSTRAINT "horarios_medicoId_fkey";

-- AlterTable
ALTER TABLE "citas" DROP COLUMN "pacienteId",
ADD COLUMN     "pacienteDni" TEXT NOT NULL,
ADD COLUMN     "pacienteNombre" TEXT NOT NULL,
ADD COLUMN     "pacienteTelef" TEXT NOT NULL;

-- DropTable
DROP TABLE "pacientes";

-- CreateIndex
CREATE INDEX "citas_pacienteTelef_idx" ON "citas"("pacienteTelef");

-- CreateIndex
CREATE UNIQUE INDEX "medicos_email_key" ON "medicos"("email");

-- AddForeignKey
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "medicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
