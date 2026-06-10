import prisma from "../../config/prisma.js";

export const getAllEspecialidadesService = async () => {
  const especialidades = await prisma.especialidad.findMany({
    include: {
      medicos: true,
    },
  });

  return especialidades;
};

export const getEspecialidadByIdService = async (id) => {
  const especialidad = await prisma.especialidad.findUnique({
    where: { id },
    include: {
      medicos: true,
    },
  });

  if (!especialidad) {
    throw new Error("Especialidad no encontrada");
  }

  return especialidad;
};
