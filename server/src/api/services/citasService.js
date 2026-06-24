import prisma from "../../config/prisma.js";

const citaInclude = {
  horario: {
    include: {
      medico: {
        include: { especialidad: true },
      },
    },
  },
};

const normalizarFecha = (fecha) => (fecha ? new Date(fecha) : new Date());

export const crearCita = async ({
  horarioId,
  pacienteNombre,
  pacienteDni,
  pacienteTelef,
  fecha,
}) => {
  if (!horarioId || !pacienteNombre || !pacienteDni || !pacienteTelef) {
    throw new Error(
      "horarioId, pacienteNombre, pacienteDni y pacienteTelef son requeridos",
    );
  }

  const horario = await prisma.horario.findUnique({ where: { id: horarioId } });
  if (!horario) {
    throw new Error("Horario no encontrado");
  }

  const fechaCita = normalizarFecha(fecha);
  const citasActivas = await prisma.cita.count({
    where: { horarioId, fecha: fechaCita, estado: "ACTIVA" },
  });

  if (citasActivas >= horario.cupos) {
    throw new Error("No hay cupos disponibles para este horario");
  }

  return prisma.cita.create({
    data: {
      horarioId,
      pacienteNombre,
      pacienteDni,
      pacienteTelef,
      fecha: fechaCita,
      estado: "ACTIVA",
    },
    include: citaInclude,
  });
};

export const obtenerTodasLasCitas = async () => {
  return prisma.cita.findMany({
    include: citaInclude,
    orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
  });
};

export const obtenerPorId = async (id) => {
  return prisma.cita.findUnique({
    where: { id },
    include: citaInclude,
  });
};

export const obtenerCitasActivasPorTelefono = async (telefono) => {
  return prisma.cita.findMany({
    where: { pacienteTelef: telefono, estado: "ACTIVA" },
    include: citaInclude,
    orderBy: [{ fecha: "asc" }, { createdAt: "asc" }],
  });
};

export const obtenerCitasPorDni = async (dni) => {
  return prisma.cita.findMany({
    where: { pacienteDni: dni },
    include: citaInclude,
    orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
  });
};

export const obtenerPacientesDesdeCitas = async () => {
  const citas = await prisma.cita.findMany({
    select: {
      pacienteDni: true,
      pacienteNombre: true,
      pacienteTelef: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const pacientes = new Map();
  for (const cita of citas) {
    if (!cita.pacienteDni) continue;

    const actual = pacientes.get(cita.pacienteDni);
    pacientes.set(cita.pacienteDni, {
      id: cita.pacienteDni,
      dni: cita.pacienteDni,
      nombre: cita.pacienteNombre,
      telefono: cita.pacienteTelef,
      citas: (actual?.citas || 0) + 1,
    });
  }

  return Array.from(pacientes.values());
};

export const cancelarCita = async (id) => {
  return cancelarCitaService(id);
};

export const cancelarCitaService = async (id) => {
  const cita = await prisma.cita.findUnique({ where: { id } });
  if (!cita) {
    throw new Error("Cita no encontrada");
  }
  if (cita.estado === "CANCELADA") {
    throw new Error("La cita ya esta cancelada");
  }

  return prisma.cita.update({
    where: { id },
    data: { estado: "CANCELADA" },
    include: citaInclude,
  });
};

export const reprogramarCita = async (citaId, nuevoHorarioId, nuevaFecha) => {
  const cita = await prisma.cita.findUnique({ where: { id: citaId } });
  if (!cita) {
    throw new Error("Cita no encontrada");
  }

  const horario = await prisma.horario.findUnique({
    where: { id: nuevoHorarioId },
  });
  if (!horario) {
    throw new Error("Horario no encontrado");
  }

  const fecha = normalizarFecha(nuevaFecha || cita.fecha);
  const citasActivas = await prisma.cita.count({
    where: {
      horarioId: nuevoHorarioId,
      fecha,
      estado: "ACTIVA",
      NOT: { id: citaId },
    },
  });

  if (citasActivas >= horario.cupos) {
    throw new Error("No hay cupos disponibles en el nuevo horario");
  }

  return prisma.cita.update({
    where: { id: citaId },
    data: { horarioId: nuevoHorarioId, fecha },
    include: citaInclude,
  });
};

export const createCitaService = crearCita;
export const getAllCitasService = obtenerTodasLasCitas;
export const getCitaByIdService = obtenerPorId;
export const getCitasByDniService = obtenerCitasPorDni;
export const reprogramarCitaService = reprogramarCita;
