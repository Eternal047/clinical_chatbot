import prisma from '../../config/prisma.js';

export const obtenerPorEspecialidad = async (nombreEspecialidad) => {
  return await prisma.medico.findMany({
    where: {
      especialidad: {
        nombre: nombreEspecialidad
      }
    },
    include: {
      especialidad: true,
      horarios: true
    }
  });
};

export const obtenerPorId = async (id) => {
  return await prisma.medico.findUnique({
    where: { id },
    include: {
      especialidad: true,
      horarios: true
    }
  });
};