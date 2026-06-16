import prisma from '../../config/prisma.js';

export const obtenerHorariosDisponibles = async (medicoId) => {
  const horarios = await prisma.horario.findMany({
    where: { medicoId },
    include: {
      _count: {
        select: { citas: { where: { estado: 'ACTIVA' } } }
      }
    }
  });

  return horarios
    .filter(h => h._count.citas < h.cupos)
    .map(h => ({
      id: h.id,
      diaSemana: h.diaSemana,
      horaInicio: h.horaInicio,
      horaFin: h.horaFin,
      cupos: h.cupos,
    }));
};