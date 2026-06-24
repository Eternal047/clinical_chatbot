import prisma from "../../config/prisma.js";

const horarioInclude = {
  medico: {
    include: { especialidad: true },
  },
};

const validarHorario = ({ medicoId, diaSemana, horaInicio, horaFin, cupos }) => {
  if (!medicoId || !diaSemana || !horaInicio || !horaFin || !cupos) {
    throw new Error("medicoId, diaSemana, horaInicio, horaFin y cupos son requeridos");
  }

  if (horaInicio >= horaFin) {
    throw new Error("La hora de inicio debe ser menor que la hora de fin");
  }

  const cuposNumero = Number(cupos);
  if (!Number.isInteger(cuposNumero) || cuposNumero < 1) {
    throw new Error("cupos debe ser un numero entero mayor a cero");
  }

  return cuposNumero;
};

export const obtenerTodosHorarios = async () => {
  return prisma.horario.findMany({
    include: horarioInclude,
    orderBy: [{ medicoId: "asc" }, { diaSemana: "asc" }, { horaInicio: "asc" }],
  });
};

export const obtenerHorariosDisponibles = async (medicoId) => {
  const horarios = await prisma.horario.findMany({
    where: medicoId ? { medicoId } : {},
    include: {
      ...horarioInclude,
      _count: {
        select: { citas: { where: { estado: "ACTIVA" } } },
      },
    },
    orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
  });

  return horarios.filter((horario) => horario._count.citas < horario.cupos);
};

export const obtenerHorariosDisponiblesPorEspecialidad = async (especialidad) => {
  const horarios = await prisma.horario.findMany({
    where: especialidad
      ? {
          medico: {
            especialidad: {
              nombre: { equals: especialidad, mode: "insensitive" },
            },
          },
        }
      : {},
    include: {
      ...horarioInclude,
      _count: {
        select: { citas: { where: { estado: "ACTIVA" } } },
      },
    },
    orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
  });

  return horarios.filter((horario) => horario._count.citas < horario.cupos);
};

export const crearHorarioService = async (data) => {
  const cupos = validarHorario(data);
  const medico = await prisma.medico.findUnique({ where: { id: data.medicoId } });

  if (!medico) {
    throw new Error("Medico no encontrado");
  }

  return prisma.horario.create({
    data: {
      medicoId: data.medicoId,
      diaSemana: data.diaSemana,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      cupos,
    },
    include: horarioInclude,
  });
};

export const getHorariosDisponiblesService = obtenerHorariosDisponiblesPorEspecialidad;
export const createHorarioService = async (medicoId, diaSemana, horaInicio, horaFin, cupos) => {
  return crearHorarioService({ medicoId, diaSemana, horaInicio, horaFin, cupos });
};