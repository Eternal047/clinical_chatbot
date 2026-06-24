import { obtenerPorEspecialidad } from "../../api/services/medicosService.js";

export default async (parameters = {}) => {
  try {
    const medicos = await obtenerPorEspecialidad(parameters.especialidad);

    if (!medicos.length) {
      return parameters.especialidad
        ? `No encontramos medicos en la especialidad de ${parameters.especialidad}.`
        : "No hay medicos registrados en este momento.";
    }

    const lista = medicos
      .map((medico) => {
        const horarios = medico.horarios?.length
          ? medico.horarios
              .map((horario) => `${horario.diaSemana} ${horario.horaInicio}-${horario.horaFin}`)
              .join("; ")
          : "sin horarios registrados";
        return `- ${medico.nombre} (${medico.especialidad?.nombre || "Sin especialidad"}) - ${horarios}`;
      })
      .join("\n");

    return `Medicos disponibles${parameters.especialidad ? ` en ${parameters.especialidad}` : ""}:\n\n${lista}`;
  } catch (error) {
    console.error("Error en consultar_medicos:", error);
    return "Lo siento, ocurrio un error al consultar los medicos.";
  }
};