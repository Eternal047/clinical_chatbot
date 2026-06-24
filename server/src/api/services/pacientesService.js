import {
  obtenerCitasPorDni,
  obtenerPacientesDesdeCitas,
} from "./citasService.js";

export const getAllPacientesService = async () => {
  return obtenerPacientesDesdeCitas();
};

export const getPacienteByIdService = async (id) => {
  const pacientes = await obtenerPacientesDesdeCitas();
  const paciente = pacientes.find((item) => item.id === id || item.dni === id);

  if (!paciente) {
    throw new Error("Paciente no encontrado");
  }

  return {
    ...paciente,
    citas: await obtenerCitasPorDni(paciente.dni),
  };
};

export const getPacienteByDniService = async (dni) => {
  const pacientes = await obtenerPacientesDesdeCitas();
  const paciente = pacientes.find((item) => item.dni === dni);

  if (!paciente) {
    throw new Error("Paciente no encontrado");
  }

  return {
    ...paciente,
    citas: await obtenerCitasPorDni(dni),
  };
};