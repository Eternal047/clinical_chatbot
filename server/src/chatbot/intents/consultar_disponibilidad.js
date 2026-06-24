import { obtenerHorariosDisponiblesPorEspecialidad } from "../../api/services/horariosService.js";

export default async (parameters = {}) => {
  try {
    const { especialidad } = parameters;

    if (!especialidad) {
      return "Para consultar disponibilidad necesito la especialidad.";
    }

    const horarios = await obtenerHorariosDisponiblesPorEspecialidad(especialidad);

    if (!horarios.length) {
      return `No hay horarios disponibles para ${especialidad}.`;
    }

    const lista = horarios
      .map(
        (horario) =>
          `- Dr/a. ${horario.medico.nombre}: ${horario.diaSemana} ${horario.horaInicio}-${horario.horaFin}`,
      )
      .join("\n");

    return `Horarios disponibles para ${especialidad}:\n${lista}`;
  } catch (error) {
    console.error("Error en consultar_disponibilidad:", error);
    return "Lo siento, ocurrio un error al consultar disponibilidad.";
  }
};