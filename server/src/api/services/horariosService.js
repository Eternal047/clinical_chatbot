import prisma from "../../config/prisma.js";

export const getHorariosDisponiblesService = async (especialidad, fecha) => {
  const where = {};

  if (especialidad) {
    where.medico = {
      especialidades: {
        some: {
          nombre: especialidad,
        },
      },
    };
  }

  const horarios = await prisma.horario.findMany({
    where,
    include: {
      medico: {
        include: {
          especialidades: true,
        },
      },
      _count: {
        select: {
          citas: {
            where: {
              fecha: fecha ? new Date(fecha) : undefined,
              estado: "ACTIVA",
            },
          },
        },
      },
    },
  });

  // Filtrar solo horarios con cupos disponibles
  const disponibles = horarios.filter((h) => h._count.citas < h.cupos);

  return disponibles;
};

export const createHorarioService = async (
  medicoId,
  diaSemana,
  horaInicio,
  horaFin,
  cupos,
) => {
  // Validar que el médico existe
  const medico = await prisma.medico.findUnique({
    where: { id: medicoId },
  });

  if (!medico) {
    throw new Error("Médico no encontrado");
  }

  const horario = await prisma.horario.create({
    data: {
      medicoId,
      diaSemana,
      horaInicio,
      horaFin,
      cupos,
    },
    include: {
      medico: true,
    },
  });

  return horario;
};

export const updateHorarioService = async (id, data) => {
  const horario = await prisma.horario.findUnique({
    where: { id },
  });

  if (!horario) {
    throw new Error("Horario no encontrado");
  }

  const horarioActualizado = await prisma.horario.update({
    where: { id },
    data,
    include: {
      medico: true,
    },
  });

  return horarioActualizado;
};
