/*
  Warnings:

  - The values [REPROGRAMADA] on the enum `EstadoCita` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `_EspecialidadToMedico` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `especialidadId` to the `medicos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoCita_new" AS ENUM ('ACTIVA', 'CANCELADA');
ALTER TABLE "citas" ALTER COLUMN "estado" TYPE "EstadoCita_new" USING ("estado"::text::"EstadoCita_new");
ALTER TYPE "EstadoCita" RENAME TO "EstadoCita_old";
ALTER TYPE "EstadoCita_new" RENAME TO "EstadoCita";
DROP TYPE "public"."EstadoCita_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "_EspecialidadToMedico" DROP CONSTRAINT "_EspecialidadToMedico_A_fkey";

-- DropForeignKey
ALTER TABLE "_EspecialidadToMedico" DROP CONSTRAINT "_EspecialidadToMedico_B_fkey";

-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_horarioId_fkey";

-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "horarios" DROP CONSTRAINT "horarios_medicoId_fkey";

-- AlterTable
ALTER TABLE "citas" ALTER COLUMN "estado" SET DEFAULT 'ACTIVA';

-- AlterTable
ALTER TABLE "medicos" ADD COLUMN     "especialidadId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_EspecialidadToMedico";

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "horarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
