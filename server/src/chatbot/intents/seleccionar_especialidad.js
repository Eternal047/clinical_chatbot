import { mostrarMedicos } from "./solicitar_cita.js";

export const procesarSeleccionarEspecialidad = async (queryResult) => {
  const especialidad = queryResult.parameters?.especialidad;
  const telefono = queryResult.telefonoUsuario;

  if (!especialidad) {
    return {
      text: "No entendi la especialidad. Por favor, intentalo de nuevo.",
      contexts: queryResult.outputContexts || [],
    };
  }

  return mostrarMedicos(especialidad, telefono, queryResult);
};