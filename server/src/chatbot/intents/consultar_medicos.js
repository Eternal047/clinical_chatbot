import { getAllMedicosService } from "../../api/services/medicosService.js";

export default async (parameters) => {
  try {
    const { especialidad } = parameters;

    // Obtener médicos (con filtro opcional)
    const medicos = await getAllMedicosService(especialidad);

    if (medicos.length === 0) {
      return especialidad
        ? `No encontramos médicos en la especialidad de ${especialidad}.`
        : "No hay médicos disponibles en este momento.";
    }

    const listaMedicos = medicos
      .map((m) => {
        const espec = m.especialidades.map((e) => e.nombre).join(", ");
        return `- Dr/Dra. ${m.nombre}\n  Especialidades: ${espec}`;
      })
      .join("\n");

    return `👨‍⚕️ Médicos disponibles${especialidad ? ` en ${especialidad}` : ""}:\n\n${listaMedicos}\n\nEscribe "consultar disponibilidad" para agendar una cita.`;
  } catch (error) {
    console.error("Error en consultar_medicos:", error);
    return "Lo siento, ocurrió un error al consultar los médicos.";
  }
};
