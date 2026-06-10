import { getHorariosDisponiblesService } from "../../api/services/horariosService.js";

export default async (parameters) => {
  try {
    const { especialidad, fecha } = parameters;

    if (!especialidad) {
      return "Para consultar disponibilidad necesito la especialidad. ¿Cuál especialidad necesitas?";
    }

    if (!fecha) {
      return "Por favor especifica la fecha para la cual deseas consultar disponibilidad.";
    }

    // Obtener horarios disponibles
    const horarios = await getHorariosDisponiblesService(especialidad, fecha);

    if (horarios.length === 0) {
      return `No hay horarios disponibles para ${especialidad} en ${fecha}. ¿Te gustaría intentar con otra fecha?`;
    }

    const listaHorarios = horarios
      .map(
        (h) => `- Dr/Dra. ${h.medico.nombre}: ${h.horaInicio} a ${h.horaFin}`,
      )
      .join("\n");

    return `✅ Horarios disponibles para ${especialidad} en ${fecha}:\n${listaHorarios}

Escribe "solicitar cita" si deseas agendar con alguno de estos médicos.`;
  } catch (error) {
    console.error("Error en consultar_disponibilidad:", error);
    return "Lo siento, ocurrió un error al consultar disponibilidad.";
  }
};
