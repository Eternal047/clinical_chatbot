import { construirOpcionesMedicas } from "./solicitar_cita.js";

const limpiarContextos = (queryResult) =>
  (queryResult.outputContexts || []).map((contexto) => ({
    name: contexto.name,
    lifespanCount: 0,
  }));

export const procesarSeleccionarEspecialidadInfo = async (queryResult) => {
  const especialidad = queryResult.parameters?.especialidad;

  if (!especialidad) {
    return {
      text: "No entendi la especialidad. Por favor, intentalo de nuevo.",
      contexts: queryResult.outputContexts || [],
    };
  }

  const opciones = await construirOpcionesMedicas(especialidad);

  if (!opciones.length) {
    return {
      text: `No hay horarios disponibles para ${especialidad}.`,
      contexts: limpiarContextos(queryResult),
    };
  }

  const lista = opciones
    .map(
      (opcion) =>
        `- Dr/a. ${opcion.nombreMedico} - ${opcion.dia} ${opcion.horaInicio}-${opcion.horaFin}`,
    )
    .join("\n");

  return {
    text: `Horarios disponibles en ${especialidad}:\n\n${lista}\n\nNecesitas algo mas?`,
    contexts: limpiarContextos(queryResult),
  };
};