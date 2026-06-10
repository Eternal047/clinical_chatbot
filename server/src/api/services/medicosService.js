import prisma from "../../config/prisma.js";

export const getAllMedicosService = async (especialidad) => {
  const where = {};

  if (especialidad) {
    where.especialidades = {
      some: {
        nombre: especialidad,
      },
    };
  }

  const medicos = await prisma.medico.findMany({
    where,
    include: {
      especialidades: true,
      horarios: true,
    },
  });

  return medicos;
};

export const getMedicoByIdService = async (id) => {
  const medico = await prisma.medico.findUnique({
    where: { id },
    include: {
      especialidades: true,
      horarios: {
        include: {
          citas: true,
        },
      },
    },
  });

  if (!medico) {
    throw new Error("Médico no encontrado");
  }

  return medico;
};
