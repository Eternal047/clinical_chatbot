import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Especialidades
  const cardiologia = await prisma.especialidad.create({ data: { nombre: "Cardiología" } });
  const dermatologia = await prisma.especialidad.create({ data: { nombre: "Dermatología" } });
  const neurologia = await prisma.especialidad.create({ data: { nombre: "Neurología" } });
  const pediatria = await prisma.especialidad.create({ data: { nombre: "Pediatría" } });
  const oftalmologia = await prisma.especialidad.create({ data: { nombre: "Oftalmología" } });
  const odontologia = await prisma.especialidad.create({ data: { nombre: "Odontología" } });

  // Médicos
  const medico1 = await prisma.medico.create({
    data: { nombre: "Dr. Juan Pérez", email: "juan@clinica.com", especialidadId: cardiologia.id }
  });
  const medico2 = await prisma.medico.create({
    data: { nombre: "Dra. María López", email: "maria@clinica.com", especialidadId: pediatria.id }
  });
  const medico3 = await prisma.medico.create({
    data: { nombre: "Dr. Carlos Ruiz", email: "carlos@clinica.com", especialidadId: neurologia.id }
  });

  // Horarios
  await prisma.horario.create({
    data: { medicoId: medico1.id, diaSemana: "LUNES", horaInicio: "09:00", horaFin: "12:00", cupos: 5 }
  });
  await prisma.horario.create({
    data: { medicoId: medico1.id, diaSemana: "MIERCOLES", horaInicio: "09:00", horaFin: "12:00", cupos: 5 }
  });
  await prisma.horario.create({
    data: { medicoId: medico2.id, diaSemana: "MARTES", horaInicio: "10:00", horaFin: "13:00", cupos: 7 }
  });
  await prisma.horario.create({
    data: { medicoId: medico2.id, diaSemana: "JUEVES", horaInicio: "10:00", horaFin: "13:00", cupos: 8 }
  });
  await prisma.horario.create({
    data: { medicoId: medico3.id, diaSemana: "VIERNES", horaInicio: "08:00", horaFin: "11:00", cupos: 8 }
  });

  // Administrador
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.administrador.create({
    data: { nombre: "Administrador", email: "admin@clinica.com", passwordHash }
  });

  // Pacientes de prueba
  await prisma.paciente.create({
    data: { nombre: "Kelly Bellido", dni: "73007495", telefono: "+51993354680" }
  });

  console.log("✅ Seed completado");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());