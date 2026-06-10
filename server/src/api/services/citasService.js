import prisma from "../../config/prisma.js";

export const createCitaService = async (pacienteId, horarioId, fecha) => {
  // Validar que el paciente existe
  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId },
  });

  if (!paciente) {
    throw new Error("Paciente no encontrado");
  }

  // Validar que el horario existe
  const horario = await prisma.horario.findUnique({
    where: { id: horarioId },
  });

  if (!horario) {
    throw new Error("Horario no encontrado");
  }

  // Validar disponibilidad de cupos
  const citasActivas = await prisma.cita.count({
    where: {
      horarioId,
      fecha,
      estado: "ACTIVA",
    },
  });

  if (citasActivas >= horario.cupos) {
    throw new Error("No hay cupos disponibles para este horario");
  }

  // Crear cita
  const cita = await prisma.cita.create({
    data: {
      pacienteId,
      horarioId,
      fecha,
      estado: "ACTIVA",
    },
    include: {
      paciente: true,
      horario: {
        include: {
          medico: true,
        },
      },
    },
  });

  return cita;
};

export const getAllCitasService = async () => {
  const citas = await prisma.cita.findMany({
    include: {
      paciente: true,
      horario: {
        include: {
          medico: true,
        },
      },
    },
    orderBy: { fecha: "desc" },
  });

  return citas;
};

export const getCitaByIdService = async (id) => {
  const cita = await prisma.cita.findUnique({
    where: { id },
    include: {
      paciente: true,
      horario: {
        include: {
          medico: true,
        },
      },
    },
  });

  if (!cita) {
    throw new Error("Cita no encontrada");
  }

  return cita;
};

export const getCitasByDniService = async (dni) => {
  const paciente = await prisma.paciente.findUnique({
    where: { dni },
  });

  if (!paciente) {
    throw new Error("Paciente no encontrado");
  }

  const citas = await prisma.cita.findMany({
    where: {
      pacienteId: paciente.id,
      estado: "ACTIVA",
    },
    include: {
      horario: {
        include: {
          medico: true,
        },
      },
    },
    orderBy: { fecha: "asc" },
  });

  return citas;
};

export const cancelarCitaService = async (id) => {
  const cita = await prisma.cita.findUnique({
    where: { id },
  });

  if (!cita) {
    throw new Error("Cita no encontrada");
  }

  const citaActualizada = await prisma.cita.update({
    where: { id },
    data: { estado: "CANCELADA" },
    include: {
      paciente: true,
      horario: {
        include: {
          medico: true,
        },
      },
    },
  });

  return citaActualizada;
};

export const reprogramarCitaService = async (
  id,
  nuevoHorarioId,
  nuevoFecha,
) => {
  const cita = await prisma.cita.findUnique({
    where: { id },
  });

  if (!cita) {
    throw new Error("Cita no encontrada");
  }

  // Validar nuevo horario
  const nuevoHorario = await prisma.horario.findUnique({
    where: { id: nuevoHorarioId },
  });

  if (!nuevoHorario) {
    throw new Error("Nuevo horario no encontrado");
  }

  // Validar disponibilidad del nuevo horario
  const citasActivas = await prisma.cita.count({
    where: {
      horarioId: nuevoHorarioId,
      fecha: nuevoFecha,
      estado: "ACTIVA",
    },
  });

  if (citasActivas >= nuevoHorario.cupos) {
    throw new Error("No hay cupos disponibles en el nuevo horario");
  }

  // Actualizar cita
  const citaActualizada = await prisma.cita.update({
    where: { id },
    data: {
      horarioId: nuevoHorarioId,
      fecha: nuevoFecha,
      estado: "ACTIVA",
    },
    include: {
      paciente: true,
      horario: {
        include: {
          medico: true,
        },
      },
    },
  });

  return citaActualizada;
};
