import prisma from "../../config/prisma.js";

const medicoInclude = {
  especialidad: true,
  horarios: {
    orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
  },
};

export const obtenerTodosMedicos = async () => {
  return prisma.medico.findMany({
    include: medicoInclude,
    orderBy: { nombre: "asc" },
  });
};

export const obtenerPorEspecialidad = async (nombreEspecialidad) => {
  if (!nombreEspecialidad) {
    return obtenerTodosMedicos();
  }

  return prisma.medico.findMany({
    where: {
      especialidad: {
        nombre: { equals: nombreEspecialidad, mode: "insensitive" },
      },
    },
    include: medicoInclude,
    orderBy: { nombre: "asc" },
  });
};

export const obtenerPorId = async (id) => {
  return prisma.medico.findUnique({
    where: { id },
    include: medicoInclude,
  });
};

export const crearMedico = async ({ nombre, email, especialidadId }) => {
  if (!nombre || !email || !especialidadId) {
    throw new Error("nombre, email y especialidadId son requeridos");
  }

  const especialidad = await prisma.especialidad.findUnique({
    where: { id: especialidadId },
  });
  if (!especialidad) {
    throw new Error("Especialidad no encontrada");
  }

  return prisma.medico.create({
    data: { nombre, email, especialidadId },
    include: medicoInclude,
  });
};

export const getAllMedicosService = obtenerPorEspecialidad;
export const getMedicoByIdService = obtenerPorId;
export const createMedicoService = crearMedico;
