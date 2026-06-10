import prisma from "../src/config/prisma.js";
import bcryptjs from "bcryptjs";

async function main() {
  console.log("🌱 Iniciando seeding de base de datos...");

  try {
    // 1. Crear Especialidades
    console.log("📋 Creando especialidades...");
    const especialidades = await prisma.especialidad.createMany({
      data: [
        { nombre: "Cardiología" },
        { nombre: "Dermatología" },
        { nombre: "Neurología" },
        { nombre: "Pediatría" },
        { nombre: "Oftalmología" },
        { nombre: "Odontología" },
      ],
      skipDuplicates: true,
    });
    console.log(`✅ ${especialidades.count} especialidades creadas`);

    // 2. Obtener especialidades creadas
    const todasEspecialidades = await prisma.especialidad.findMany();

    // 3. Crear Médicos
    console.log("👨‍⚕️ Creando médicos...");
    const medicosData = [
      {
        nombre: "Dr. Juan García",
        email: "juan.garcia@clinic.com",
        especialidades: {
          connect: [{ id: todasEspecialidades[0].id }], // Cardiología
        },
      },
      {
        nombre: "Dra. María López",
        email: "maria.lopez@clinic.com",
        especialidades: {
          connect: [{ id: todasEspecialidades[1].id }], // Dermatología
        },
      },
      {
        nombre: "Dr. Carlos Rodríguez",
        email: "carlos.rodriguez@clinic.com",
        especialidades: {
          connect: [{ id: todasEspecialidades[2].id }], // Neurología
        },
      },
      {
        nombre: "Dra. Ana Martínez",
        email: "ana.martinez@clinic.com",
        especialidades: {
          connect: [{ id: todasEspecialidades[3].id }], // Pediatría
        },
      },
      {
        nombre: "Dr. Luis Fernández",
        email: "luis.fernandez@clinic.com",
        especialidades: {
          connect: [{ id: todasEspecialidades[4].id }], // Oftalmología
        },
      },
    ];

    const medicos = [];
    for (const medicoData of medicosData) {
      const medico = await prisma.medico.create({
        data: medicoData,
        include: { especialidades: true },
      });
      medicos.push(medico);
    }
    console.log(`✅ ${medicos.length} médicos creados`);

    // 4. Crear Horarios
    console.log("⏰ Creando horarios...");
    const horariosData = [
      // Dr. Juan García - Lunes a Viernes
      {
        medicoId: medicos[0].id,
        diaSemana: "LUNES",
        horaInicio: "09:00",
        horaFin: "12:00",
        cupos: 4,
      },
      {
        medicoId: medicos[0].id,
        diaSemana: "LUNES",
        horaInicio: "14:00",
        horaFin: "18:00",
        cupos: 4,
      },
      {
        medicoId: medicos[0].id,
        diaSemana: "MARTES",
        horaInicio: "09:00",
        horaFin: "12:00",
        cupos: 4,
      },
      {
        medicoId: medicos[0].id,
        diaSemana: "MIERCOLES",
        horaInicio: "09:00",
        horaFin: "12:00",
        cupos: 4,
      },

      // Dra. María López - Lunes a Viernes
      {
        medicoId: medicos[1].id,
        diaSemana: "LUNES",
        horaInicio: "08:00",
        horaFin: "11:00",
        cupos: 3,
      },
      {
        medicoId: medicos[1].id,
        diaSemana: "MARTES",
        horaInicio: "15:00",
        horaFin: "18:00",
        cupos: 3,
      },
      {
        medicoId: medicos[1].id,
        diaSemana: "JUEVES",
        horaInicio: "09:00",
        horaFin: "12:00",
        cupos: 3,
      },
      {
        medicoId: medicos[1].id,
        diaSemana: "VIERNES",
        horaInicio: "14:00",
        horaFin: "17:00",
        cupos: 3,
      },

      // Dr. Carlos Rodríguez - Lunes a Sábado
      {
        medicoId: medicos[2].id,
        diaSemana: "LUNES",
        horaInicio: "10:00",
        horaFin: "13:00",
        cupos: 5,
      },
      {
        medicoId: medicos[2].id,
        diaSemana: "MIERCOLES",
        horaInicio: "16:00",
        horaFin: "19:00",
        cupos: 5,
      },
      {
        medicoId: medicos[2].id,
        diaSemana: "SABADO",
        horaInicio: "09:00",
        horaFin: "12:00",
        cupos: 3,
      },

      // Dra. Ana Martínez - Lunes a Viernes
      {
        medicoId: medicos[3].id,
        diaSemana: "MARTES",
        horaInicio: "08:00",
        horaFin: "11:00",
        cupos: 6,
      },
      {
        medicoId: medicos[3].id,
        diaSemana: "JUEVES",
        horaInicio: "14:00",
        horaFin: "17:00",
        cupos: 6,
      },
      {
        medicoId: medicos[3].id,
        diaSemana: "VIERNES",
        horaInicio: "09:00",
        horaFin: "12:00",
        cupos: 6,
      },

      // Dr. Luis Fernández - Lunes a Viernes
      {
        medicoId: medicos[4].id,
        diaSemana: "LUNES",
        horaInicio: "14:00",
        horaFin: "17:00",
        cupos: 4,
      },
      {
        medicoId: medicos[4].id,
        diaSemana: "MIERCOLES",
        horaInicio: "09:00",
        horaFin: "12:00",
        cupos: 4,
      },
      {
        medicoId: medicos[4].id,
        diaSemana: "VIERNES",
        horaInicio: "15:00",
        horaFin: "18:00",
        cupos: 4,
      },
    ];

    const horarios = await prisma.horario.createMany({
      data: horariosData,
    });
    console.log(`✅ ${horarios.count} horarios creados`);

    // 5. Crear Pacientes
    console.log("👥 Creando pacientes de prueba...");
    const pacientes = await prisma.paciente.createMany({
      data: [
        { nombre: "Pedro Pérez", dni: "12345678", telefono: "+51987654321" },
        { nombre: "Laura Gómez", dni: "87654321", telefono: "+51987654322" },
        {
          nombre: "Roberto Sánchez",
          dni: "11223344",
          telefono: "+51987654323",
        },
        {
          nombre: "Patricia Flores",
          dni: "55667788",
          telefono: "+51987654324",
        },
        { nombre: "Miguel Ángel", dni: "99887766", telefono: "+51987654325" },
      ],
      skipDuplicates: true,
    });
    console.log(`✅ ${pacientes.count} pacientes creados`);

    // 6. Crear Administrador
    console.log("🔐 Creando administrador...");
    const passwordHash = await bcryptjs.hash("admin123", 10);
    const admin = await prisma.administrador.create({
      data: {
        nombre: "Administrador Sistema",
        email: "admin@clinic.com",
        passwordHash,
      },
    });
    console.log(`✅ Administrador creado`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Contraseña: admin123`);

    console.log("\n✨ ¡Seeding completado exitosamente!");
    console.log("\n📊 Resumen:");
    console.log(`  - Especialidades: ${especialidades.count}`);
    console.log(`  - Médicos: ${medicos.length}`);
    console.log(`  - Horarios: ${horarios.count}`);
    console.log(`  - Pacientes: ${pacientes.count}`);
    console.log(`  - Administrador: 1`);
  } catch (error) {
    console.error("❌ Error durante el seeding:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
