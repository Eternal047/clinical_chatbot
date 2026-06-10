import {
  getCitasByDniService,
  cancelarCitaService,
} from "../../api/services/citasService.js";

export default async (parameters) => {
  try {
    const { dni } = parameters;

    if (!dni) {
      return "Para cancelar una cita necesito tu DNI. ¿Cuál es tu número de DNI?";
    }

    // Obtener citas activas del paciente
    const citas = await getCitasByDniService(dni);

    if (citas.length === 0) {
      return `No encontramos citas activas para el DNI: ${dni}`;
    }

    // Si hay una sola cita, cancelarla
    if (citas.length === 1) {
      const citaCancelada = await cancelarCitaService(citas[0].id);
      return `✅ Tu cita ha sido cancelada exitosamente.
Fecha de cita: ${citaCancelada.fecha.toLocaleDateString("es-PE")}`;
    }

    // Si hay varias citas, pedir que especifique cuál cancelar
    const listaCitas = citas
      .map(
        (cita, index) =>
          `${index + 1}. ${cita.horario.medico.nombre} - ${cita.fecha.toLocaleDateString(
            "es-PE",
          )}`,
      )
      .join("\n");

    return `Tienes ${citas.length} citas activas. ¿Cuál deseas cancelar?\n${listaCitas}`;
  } catch (error) {
    console.error("Error en cancelar_cita:", error);
    return "Lo siento, ocurrió un error al procesar tu solicitud de cancelación.";
  }
};
