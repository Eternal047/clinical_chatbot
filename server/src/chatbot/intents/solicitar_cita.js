import {
  createCitaService,
  getCitasByDniService,
} from "../../api/services/citasService.js";

export default async (parameters) => {
  try {
    const { especialidad, date, time } = parameters;

    if (!especialidad || !date || !time) {
      return "Para solicitar una cita necesito: especialidad, fecha y hora. ¿Podrías proporcionar estos datos?";
    }

    // Buscar horario disponible
    // Nota: En una implementación real, buscarías el horarioId basado en especialidad y hora
    // Por ahora retornamos un mensaje genérico
    return `✅ Tu solicitud de cita ha sido recibida:
- Especialidad: ${especialidad}
- Fecha: ${date}
- Hora: ${time}

Un administrador se pondrá en contacto pronto para confirmar la disponibilidad.`;
  } catch (error) {
    console.error("Error en solicitar_cita:", error);
    return "Lo siento, ocurrió un error al procesar tu solicitud de cita.";
  }
};
