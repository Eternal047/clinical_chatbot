import { getAllEspecialidadesService } from "../../api/services/especialidadesService.js";

export default async () => {
  try {
    const especialidades = await getAllEspecialidadesService();

    if (!especialidades.length) {
      return "No hay especialidades disponibles en este momento.";
    }

    const lista = especialidades
      .map((especialidad) => `- ${especialidad.nombre} (${especialidad.medicos.length} medicos)`)
      .join("\n");

    return `Especialidades disponibles:\n\n${lista}`;
  } catch (error) {
    console.error("Error en consultar_especialidades:", error);
    return "Lo siento, ocurrio un error al consultar las especialidades.";
  }
};