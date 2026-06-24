import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // --- LIMPIEZA PREVIA (Borrar todo excepto el admin) ---
  console.log("🧹 Limpiando base de datos (excepto administrador)...");
  await prisma.cita.deleteMany({});
  await prisma.horario.deleteMany({});
  await prisma.medico.deleteMany({});
  await prisma.especialidad.deleteMany({});
  console.log("✅ Base de datos limpiada.");

  // 1. Especialidades
  const especialidadesData = [
    { nombre: "Imagenología (Rayos X)" },
    { nombre: "Alergología" },
    { nombre: "Dermatología" },
    { nombre: "Psicología" },
    { nombre: "Ginecología" },
    { nombre: "Nutrición" },
    { nombre: "Medicina General" },
    { nombre: "Terapia Física y Rehabilitación" },
    { nombre: "Odontología" },
    { nombre: "Terapia de Lenguaje" },
    { nombre: "Traumatología" },
    { nombre: "Neumología" },
    { nombre: "Medicina del Estilo de Vida" },
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
    especialidades.map((e) => [e.nombre, e.id]),
  );

  // 2. Médicos
  const medicosData = [
    // Imagenología
    { nombre: "Dr. Carlos Ruperto Vera Quispe", email: "carlos.vera@clinica.com", especialidadId: especialidadMap["Imagenología (Rayos X)"] },
    // Alergología
    { nombre: "Dr. Teófilo Quispe Chullo", email: "teofilo.quispe@clinica.com", especialidadId: especialidadMap["Alergología"] },
    // Dermatología
    { nombre: "Dr. Cesar Augusto Hernández Bazán", email: "cesar.hernandez@clinica.com", especialidadId: especialidadMap["Dermatología"] },
    // Psicología
    { nombre: "Dra. Ana Wong", email: "ana.wong@clinica.com", especialidadId: especialidadMap["Psicología"] },
    // Ginecología
    { nombre: "Dr. Julio Aguilar", email: "julio.aguilar@clinica.com", especialidadId: especialidadMap["Ginecología"] },
    // Nutrición
    { nombre: "Nutricionista Jessica Díaz C.", email: "jessica.diaz@clinica.com", especialidadId: especialidadMap["Nutrición"] },
    // Medicina General
    { nombre: "Dr. Mario Javier López Veliz", email: "mario.lopez@clinica.com", especialidadId: especialidadMap["Medicina General"] },
    { nombre: "Dra. Alejandra Luisa Salazar Bazan", email: "alejandra.salazar@clinica.com", especialidadId: especialidadMap["Medicina General"] },
    { nombre: "Dra. Valeria Adrianzén Antonio", email: "valeria.adrianzen@clinica.com", especialidadId: especialidadMap["Medicina General"] },
    // Terapia Física
    { nombre: "Lic. Washington Otoya Torres", email: "washington.otoya@clinica.com", especialidadId: especialidadMap["Terapia Física y Rehabilitación"] },
    { nombre: "Lic. Olga Jenny Cornejo Jurado", email: "olga.cornejo@clinica.com", especialidadId: especialidadMap["Terapia Física y Rehabilitación"] },
    { nombre: "Lic. Jerson José Muñoz Ynca", email: "jerson.munoz@clinica.com", especialidadId: especialidadMap["Terapia Física y Rehabilitación"] },
    // Odontología
    { nombre: "Dr. Carlos Alva Cabrera", email: "carlos.alva@clinica.com", especialidadId: especialidadMap["Odontología"] },
    { nombre: "Dra. Nathaly Molina Soto", email: "nathaly.molina@clinica.com", especialidadId: especialidadMap["Odontología"] },
    { nombre: "Dra. Dalmat Geremy Noa Farfán", email: "dalmat.noa@clinica.com", especialidadId: especialidadMap["Odontología"] },
    { nombre: "Dr. Francisco Durand Calderon", email: "francisco.durand@clinica.com", especialidadId: especialidadMap["Odontología"] },
    // Terapia de Lenguaje
    { nombre: "Lic. Alexandro Huanca Vargas", email: "alexandro.huanca@clinica.com", especialidadId: especialidadMap["Terapia de Lenguaje"] },
    // Traumatología
    { nombre: "Dr. Jonathan Villegas Violeta", email: "jonathan.villegas@clinica.com", especialidadId: especialidadMap["Traumatología"] },
    // Neumología
    { nombre: "Dr. Sebastian Davila Merzthal", email: "sebastian.davila@clinica.com", especialidadId: especialidadMap["Neumología"] },
    // Medicina del Estilo de Vida
    { nombre: "Dr. Darío Rodriguez Escalante", email: "dario.rodriguez@clinica.com", especialidadId: especialidadMap["Medicina del Estilo de Vida"] },
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

  // Mapeamos los IDs de los médicos recién creados a una variable para usarlos abajo
  const medicoIds = Object.fromEntries(
    medicosCreados.map((m) => [m.email, m.id])
  );

  // 3. Horarios
  // Nota: El campo 'horaInicio' y 'horaFin' en Prisma suele ser String "HH:MM" si el schema está bien definido. 
  // Si tu schema usa DateTime, el seed de Prisma lo parseará automáticamente a fecha UTC.
  const horariosData = [
    // Carlos Ruperto Vera Quispe (Imagenología)
    { medicoId: medicoIds["carlos.vera@clinica.com"], diaSemana: "LUNES", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },
    { medicoId: medicoIds["carlos.vera@clinica.com"], diaSemana: "MARTES", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },
    { medicoId: medicoIds["carlos.vera@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },
    { medicoId: medicoIds["carlos.vera@clinica.com"], diaSemana: "JUEVES", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },
    { medicoId: medicoIds["carlos.vera@clinica.com"], diaSemana: "VIERNES", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },
    { medicoId: medicoIds["carlos.vera@clinica.com"], diaSemana: "SABADO", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },

    // Teófilo Quispe Chullo (Alergología)
    { medicoId: medicoIds["teofilo.quispe@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "09:00", horaFin: "12:00", cupos: 10 },

    // Cesar Augusto Hernández Bazán (Dermatología) - Horario partido el miércoles
    { medicoId: medicoIds["cesar.hernandez@clinica.com"], diaSemana: "LUNES", horaInicio: "17:00", horaFin: "20:00", cupos: 8 },
    { medicoId: medicoIds["cesar.hernandez@clinica.com"], diaSemana: "MARTES", horaInicio: "17:00", horaFin: "20:00", cupos: 8 },
    { medicoId: medicoIds["cesar.hernandez@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "11:00", horaFin: "13:00", cupos: 8 },
    { medicoId: medicoIds["cesar.hernandez@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "17:00", horaFin: "20:00", cupos: 8 },

    // Ana Wong (Psicología)
    { medicoId: medicoIds["ana.wong@clinica.com"], diaSemana: "LUNES", horaInicio: "08:00", horaFin: "14:00", cupos: 10 },
    { medicoId: medicoIds["ana.wong@clinica.com"], diaSemana: "MARTES", horaInicio: "08:00", horaFin: "20:00", cupos: 15 },
    { medicoId: medicoIds["ana.wong@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "08:00", horaFin: "14:00", cupos: 10 },
    { medicoId: medicoIds["ana.wong@clinica.com"], diaSemana: "JUEVES", horaInicio: "08:00", horaFin: "14:00", cupos: 10 },
    { medicoId: medicoIds["ana.wong@clinica.com"], diaSemana: "VIERNES", horaInicio: "08:00", horaFin: "14:00", cupos: 10 },

    // Julio Aguilar (Ginecología)
    { medicoId: medicoIds["julio.aguilar@clinica.com"], diaSemana: "MARTES", horaInicio: "16:00", horaFin: "19:00", cupos: 8 },
    { medicoId: medicoIds["julio.aguilar@clinica.com"], diaSemana: "JUEVES", horaInicio: "16:00", horaFin: "19:00", cupos: 8 },

    // Jessica Díaz C. (Nutrición)
    { medicoId: medicoIds["jessica.diaz@clinica.com"], diaSemana: "LUNES", horaInicio: "09:00", horaFin: "15:00", cupos: 10 },
    { medicoId: medicoIds["jessica.diaz@clinica.com"], diaSemana: "JUEVES", horaInicio: "09:00", horaFin: "15:00", cupos: 10 },
    { medicoId: medicoIds["jessica.diaz@clinica.com"], diaSemana: "VIERNES", horaInicio: "09:00", horaFin: "15:00", cupos: 10 },

    // Mario Javier López Veliz (Medicina General)
    { medicoId: medicoIds["mario.lopez@clinica.com"], diaSemana: "LUNES", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },
    { medicoId: medicoIds["mario.lopez@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },
    { medicoId: medicoIds["mario.lopez@clinica.com"], diaSemana: "JUEVES", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },

    // Alejandra Luisa Salazar Bazan (Medicina General)
    { medicoId: medicoIds["alejandra.salazar@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },
    { medicoId: medicoIds["alejandra.salazar@clinica.com"], diaSemana: "VIERNES", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },
    { medicoId: medicoIds["alejandra.salazar@clinica.com"], diaSemana: "SABADO", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },

    // Valeria Adrianzén Antonio (Medicina General)
    { medicoId: medicoIds["valeria.adrianzen@clinica.com"], diaSemana: "LUNES", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },
    { medicoId: medicoIds["valeria.adrianzen@clinica.com"], diaSemana: "MARTES", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },
    { medicoId: medicoIds["valeria.adrianzen@clinica.com"], diaSemana: "SABADO", horaInicio: "08:00", horaFin: "20:00", cupos: 20 },

    // Washington Otoya Torres (Terapia Física)
    { medicoId: medicoIds["washington.otoya@clinica.com"], diaSemana: "LUNES", horaInicio: "08:00", horaFin: "12:00", cupos: 10 },
    { medicoId: medicoIds["washington.otoya@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "08:00", horaFin: "12:00", cupos: 10 },
    { medicoId: medicoIds["washington.otoya@clinica.com"], diaSemana: "VIERNES", horaInicio: "08:00", horaFin: "12:00", cupos: 10 },

    // Olga Jenny Cornejo Jurado (Terapia Física)
    { medicoId: medicoIds["olga.cornejo@clinica.com"], diaSemana: "MARTES", horaInicio: "08:00", horaFin: "11:00", cupos: 8 },
    { medicoId: medicoIds["olga.cornejo@clinica.com"], diaSemana: "JUEVES", horaInicio: "08:00", horaFin: "11:00", cupos: 8 },
    { medicoId: medicoIds["olga.cornejo@clinica.com"], diaSemana: "SABADO", horaInicio: "08:00", horaFin: "11:00", cupos: 8 },

    // Jerson José Muñoz Ynca (Terapia Física)
    { medicoId: medicoIds["jerson.munoz@clinica.com"], diaSemana: "LUNES", horaInicio: "14:00", horaFin: "18:30", cupos: 10 },
    { medicoId: medicoIds["jerson.munoz@clinica.com"], diaSemana: "MARTES", horaInicio: "14:00", horaFin: "18:30", cupos: 10 },
    { medicoId: medicoIds["jerson.munoz@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "14:00", horaFin: "18:30", cupos: 10 },
    { medicoId: medicoIds["jerson.munoz@clinica.com"], diaSemana: "JUEVES", horaInicio: "14:00", horaFin: "18:30", cupos: 10 },
    { medicoId: medicoIds["jerson.munoz@clinica.com"], diaSemana: "VIERNES", horaInicio: "14:00", horaFin: "18:30", cupos: 10 },
    { medicoId: medicoIds["jerson.munoz@clinica.com"], diaSemana: "SABADO", horaInicio: "14:00", horaFin: "18:30", cupos: 10 },

    // Carlos Alva Cabrera (Odontología)
    { medicoId: medicoIds["carlos.alva@clinica.com"], diaSemana: "LUNES", horaInicio: "14:00", horaFin: "20:00", cupos: 12 },
    { medicoId: medicoIds["carlos.alva@clinica.com"], diaSemana: "MARTES", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },
    { medicoId: medicoIds["carlos.alva@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "14:00", horaFin: "20:00", cupos: 12 },
    { medicoId: medicoIds["carlos.alva@clinica.com"], diaSemana: "JUEVES", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },
    { medicoId: medicoIds["carlos.alva@clinica.com"], diaSemana: "VIERNES", horaInicio: "14:00", horaFin: "20:00", cupos: 12 },
    { medicoId: medicoIds["carlos.alva@clinica.com"], diaSemana: "SABADO", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },

    // Nathaly Molina Soto (Odontología)
    { medicoId: medicoIds["nathaly.molina@clinica.com"], diaSemana: "LUNES", horaInicio: "09:00", horaFin: "20:00", cupos: 15 },
    { medicoId: medicoIds["nathaly.molina@clinica.com"], diaSemana: "MARTES", horaInicio: "14:00", horaFin: "20:00", cupos: 15 },
    { medicoId: medicoIds["nathaly.molina@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "09:00", horaFin: "20:00", cupos: 15 },
    { medicoId: medicoIds["nathaly.molina@clinica.com"], diaSemana: "JUEVES", horaInicio: "14:00", horaFin: "20:00", cupos: 15 },
    { medicoId: medicoIds["nathaly.molina@clinica.com"], diaSemana: "VIERNES", horaInicio: "14:00", horaFin: "20:00", cupos: 15 },

    // Dalmat Geremy Noa Farfán (Odontología)
    { medicoId: medicoIds["dalmat.noa@clinica.com"], diaSemana: "MARTES", horaInicio: "09:00", horaFin: "19:00", cupos: 12 },
    { medicoId: medicoIds["dalmat.noa@clinica.com"], diaSemana: "JUEVES", horaInicio: "09:00", horaFin: "19:00", cupos: 12 },
    { medicoId: medicoIds["dalmat.noa@clinica.com"], diaSemana: "SABADO", horaInicio: "09:00", horaFin: "19:00", cupos: 12 },

    // Francisco Durand Calderon (Odontología)
    { medicoId: medicoIds["francisco.durand@clinica.com"], diaSemana: "LUNES", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },
    { medicoId: medicoIds["francisco.durand@clinica.com"], diaSemana: "MARTES", horaInicio: "14:00", horaFin: "20:00", cupos: 12 },
    { medicoId: medicoIds["francisco.durand@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },
    { medicoId: medicoIds["francisco.durand@clinica.com"], diaSemana: "JUEVES", horaInicio: "14:00", horaFin: "20:00", cupos: 12 },
    { medicoId: medicoIds["francisco.durand@clinica.com"], diaSemana: "VIERNES", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },
    { medicoId: medicoIds["francisco.durand@clinica.com"], diaSemana: "SABADO", horaInicio: "14:00", horaFin: "20:00", cupos: 12 },

    // Alexandro Huanca Vargas (Terapia de Lenguaje)
    { medicoId: medicoIds["alexandro.huanca@clinica.com"], diaSemana: "MARTES", horaInicio: "15:00", horaFin: "19:00", cupos: 10 },

    // Jonathan Villegas Violeta (Traumatología) - Basado en fechas específicas de Marzo
    { medicoId: medicoIds["jonathan.villegas@clinica.com"], diaSemana: "LUNES", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },
    { medicoId: medicoIds["jonathan.villegas@clinica.com"], diaSemana: "JUEVES", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },

    // Sebastian Davila Merzthal (Neumología) - Basado en fechas de Marzo
    { medicoId: medicoIds["sebastian.davila@clinica.com"], diaSemana: "LUNES", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },
    { medicoId: medicoIds["sebastian.davila@clinica.com"], diaSemana: "MARTES", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },
    { medicoId: medicoIds["sebastian.davila@clinica.com"], diaSemana: "MIERCOLES", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },
    { medicoId: medicoIds["sebastian.davila@clinica.com"], diaSemana: "JUEVES", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },
    { medicoId: medicoIds["sebastian.davila@clinica.com"], diaSemana: "VIERNES", horaInicio: "08:00", horaFin: "14:00", cupos: 12 },

    // Darío Rodriguez Escalante (Medicina del Estilo de Vida)
    { medicoId: medicoIds["dario.rodriguez@clinica.com"], diaSemana: "MARTES", horaInicio: "08:00", horaFin: "10:00", cupos: 6 },
  ];

  for (const horario of horariosData) {
    await prisma.horario.create({
      data: horario,
    });
  }

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