import { getAllEspecialidadesService } from "../../api/services/especialidadesService.js";

export default async (parameters) => {
  try {
    // Obtener todas las especialidades
    const especialidades = await getAllEspecialidadesService();

    if (especialidades.length === 0) {
      return "No hay especialidades disponibles en este momento.";
    }

    const listaEspecialidades = especialidades
      .map((e) => `- ${e.nombre} (${e.medicos.length} médicos)`)
      .join("\n");

    return `🏥 Especialidades disponibles:\n\n${listaEspecialidades}\n\nEscribe "consultar médicos" para ver los profesionales de cada especialidad.`;
  } catch (error) {
    console.error("Error en consultar_especialidades:", error);
    return "Lo siento, ocurrió un error al consultar las especialidades.";
  }
};
