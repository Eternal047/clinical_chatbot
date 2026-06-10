import prisma from "../../config/prisma.js";

export const getAllPacientesService = async () => {
  const pacientes = await prisma.paciente.findMany({
    orderBy: { createdAt: "desc" },
  });

  return pacientes;
};

export const getPacienteByIdService = async (id) => {
  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: {
      citas: {
        include: {
          horario: {
            include: {
              medico: true,
            },
          },
        },
      },
    },
  });

  if (!paciente) {
    throw new Error("Paciente no encontrado");
  }

  return paciente;
};

export const getPacienteByDniService = async (dni) => {
  const paciente = await prisma.paciente.findUnique({
    where: { dni },
    include: {
      citas: {
        include: {
          horario: {
            include: {
              medico: true,
            },
          },
        },
      },
    },
  });

  if (!paciente) {
    throw new Error("Paciente no encontrado");
  }

  return paciente;
};
