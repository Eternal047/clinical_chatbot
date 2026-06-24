import prisma from "../../config/prisma.js";

const especialidadInclude = {
  medicos: {
    include: {
      horarios: {
        orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
      },
    },
    orderBy: { nombre: "asc" },
  },
};

export const getAllEspecialidadesService = async () => {
  return prisma.especialidad.findMany({
    include: especialidadInclude,
    orderBy: { nombre: "asc" },
  });
};

export const getEspecialidadByIdService = async (id) => {
  const especialidad = await prisma.especialidad.findUnique({
    where: { id },
    include: especialidadInclude,
  });

  if (!especialidad) {
    throw new Error("Especialidad no encontrada");
  }

  return especialidad;
};

export const createEspecialidadService = async ({ nombre }) => {
  if (!nombre) {
    throw new Error("nombre es requerido");
  }

  return prisma.especialidad.create({
    data: { nombre },
    include: especialidadInclude,
  });
};