import { getAllEspecialidadesService } from "../../api/services/especialidadesService.js";
import { mostrarMedicos } from "./solicitar_cita.js";
import { limpiarContextos, obtenerSesion } from "../context.utils.js";

const contextoBase = (queryResult) => {
  return obtenerSesion(queryResult);
};

export const procesarConsultarEspecialidades = async (queryResult) => {
  const telefono = queryResult.telefonoUsuario;
  const especialidad = queryResult.parameters?.especialidad;

  // Si el usuario ya menciona una especialidad directamente
  // (ej. "qué horarios tiene cardiología"), mostramos sus horarios de una vez.
  if (especialidad) {
    return mostrarMedicos(especialidad, telefono, queryResult);
  }

  const especialidades = await getAllEspecialidadesService();

  if (!especialidades.length) {
    return {
      text: "No hay especialidades disponibles en este momento.",
      contexts: limpiarContextos(queryResult),
    };
  }

  const lista = especialidades
    .map((especialidad) => `- ${especialidad.nombre}`)
    .join("\n");

  return {
    text:
      `Estas son las especialidades disponibles en la clinica:\n${lista}\n\n` +
      "Si quieres conocer los horarios de alguna, solo dime el nombre. Si no, dime en que mas te puedo ayudar.",
    contexts: [
      ...limpiarContextos(queryResult),
      {
        name: `${contextoBase(queryResult)}/contexts/awaiting_especialidad_info`,
        lifespanCount: 5,
        parameters: { telefono },
      },
    ],
  };
};
