import prisma from '../../config/prisma.js';

export const crearCita = async ({ horarioId, pacienteNombre, pacienteDni, pacienteTelef }) => {
  const cita = await prisma.cita.create({
    data: {
      horarioId,
      pacienteNombre,
      pacienteDni,
      pacienteTelef,
      fecha: new Date(), // Fecha actual como placeholder; ajustable según necesidad
      estado: 'ACTIVA'
    }
  });
  return cita;
};

export const obtenerPorId = async (id) => {
  return await prisma.cita.findUnique({
    where: { id },
    include: {
      horario: {
        include: {
          medico: {
            include: { especialidad: true }
          }
        }
      }
    }
  });
};