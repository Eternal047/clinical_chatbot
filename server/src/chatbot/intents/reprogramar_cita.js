import {
  reprogramarCitaService,
  getCitasByDniService,
} from "../../api/services/citasService.js";

export default async (parameters) => {
  try {
    const { dni, fecha, hora } = parameters;

    if (!dni) {
      return "Para reprogramar una cita necesito tu DNI. ¿Cuál es tu número de DNI?";
    }

    if (!fecha || !hora) {
      return "Para reprogramar necesito la nueva fecha y hora. ¿Cuáles prefieres?";
    }

    // Obtener citas activas del paciente
    const citas = await getCitasByDniService(dni);

    if (citas.length === 0) {
      return `No encontramos citas activas para el DNI: ${dni}`;
    }

    if (citas.length > 1) {
      const listaCitas = citas
        .map(
          (cita, index) =>
            `${index + 1}. ${cita.horario.medico.nombre} - ${cita.fecha.toLocaleDateString(
              "es-PE",
            )}`,
        )
        .join("\n");
      return `Tienes ${citas.length} citas. ¿Cuál deseas reprogramar?\n${listaCitas}`;
    }

    // Reprogramar la única cita
    // Nota: En una implementación real, buscarías el horarioId para la nueva fecha/hora
    return `📅 Tu solicitud de reprogramación ha sido recibida:
- Nueva fecha: ${fecha}
- Nueva hora: ${hora}

Un administrador confirmará la disponibilidad y te contactará.`;
  } catch (error) {
    console.error("Error en reprogramar_cita:", error);
    return "Lo siento, ocurrió un error al procesar tu solicitud de reprogramación.";
  }
};
