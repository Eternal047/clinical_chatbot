import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // 1. Especialidades
  const especialidadesData = [
    { nombre: "Cardiología" },
    { nombre: "Dermatología" },
    { nombre: "Neurología" },
    { nombre: "Pediatría" },
    { nombre: "Oftalmología" },
    { nombre: "Odontología" },
  ];

  for (const esp of especialidadesData) {
    await prisma.especialidad.upsert({
      where: { nombre: esp.nombre },
      update: {},
      create: esp,
    });
  }

  const especialidades = await prisma.especialidad.findMany();
  const especialidadMap = Object.fromEntries(
    especialidades.map((e) => [e.nombre, e.id])
  );

  // 2. Médicos
  const medicosData = [
    {
      nombre: "Dr. Juan Pérez",
      email: "juan@clinica.com",
      especialidadId: especialidadMap["Cardiología"],
    },
    {
      nombre: "Dra. María López",
      email: "maria@clinica.com",
      especialidadId: especialidadMap["Pediatría"],
    },
    {
      nombre: "Dr. Carlos Ruiz",
      email: "carlos@clinica.com",
      especialidadId: especialidadMap["Neurología"],
    },
    {
      nombre: "Dra. Ana Gómez",
      email: "ana@clinica.com",
      especialidadId: especialidadMap["Dermatología"],
    },
  ];

  const medicosCreados = [];
  for (const med of medicosData) {
    const medico = await prisma.medico.upsert({
      where: { email: med.email },
      update: {},
      create: med,
    });
    medicosCreados.push(medico);
  }

  // 3. Horarios
  const horariosData = [
    {
      medicoId: medicosCreados[0].id,
      diaSemana: "LUNES",
      horaInicio: "09:00",
      horaFin: "12:00",
      cupos: 5,
    },
    {
      medicoId: medicosCreados[0].id,
      diaSemana: "MIERCOLES",
      horaInicio: "09:00",
      horaFin: "12:00",
      cupos: 5,
    },
    {
      medicoId: medicosCreados[1].id,
      diaSemana: "MARTES",
      horaInicio: "10:00",
      horaFin: "13:00",
      cupos: 7,
    },
    {
      medicoId: medicosCreados[1].id,
      diaSemana: "JUEVES",
      horaInicio: "10:00",
      horaFin: "13:00",
      cupos: 8,
    },
    {
      medicoId: medicosCreados[2].id,
      diaSemana: "VIERNES",
      horaInicio: "08:00",
      horaFin: "11:00",
      cupos: 8,
    },
  ];

  for (const horario of horariosData) {
    await prisma.horario.create({
      data: horario,
    });
  }

  // 4. Administrador
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.administrador.upsert({
    where: { email: "admin@clinica.com" },
    update: {},
    create: {
      nombre: "Administrador",
      email: "admin@clinica.com",
      passwordHash,
    },
  });

  // 5. Obtener horarios para citas
  const horarios = await prisma.horario.findMany();
  const primerHorario = horarios[0];
  const segundoHorario = horarios[1] || horarios[0];

  // 6. Citas de prueba (sin modelo Paciente)
  const citasData = [
    {
      horarioId: primerHorario.id,
      fecha: new Date(Date.now() + 86400000),
      estado: "ACTIVA",
      pacienteDni: "73007495",
      pacienteNombre: "Kelly Bellido",
      pacienteTelef: "+51993354680",
    },
    {
      horarioId: segundoHorario.id,
      fecha: new Date(Date.now() + 172800000),
      estado: "ACTIVA",
      pacienteDni: "87654321",
      pacienteNombre: "Paciente Ejemplo",
      pacienteTelef: "+51987654321",
    },
  ];

  for (const cita of citasData) {
    await prisma.cita.create({
      data: cita,
    });
  }

  console.log("✅ Seed completado exitosamente");
  console.log(`- ${especialidadesData.length} especialidades`);
  console.log(`- ${medicosCreados.length} médicos`);
  console.log(`- ${horariosData.length} horarios`);
  console.log(`- 1 administrador (admin@clinica.com / admin123)`);
  console.log(`- ${citasData.length} citas de prueba`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });