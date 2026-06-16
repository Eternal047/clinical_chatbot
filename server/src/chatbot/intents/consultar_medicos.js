import { getAllMedicosService } from "../../api/services/medicosService.js";

export default async (parameters) => {
  try {
    const { especialidad } = parameters;
    const medicos = await getAllMedicosService(especialidad);

    if (medicos.length === 0) {
      return especialidad
        ? `No encontramos medicos en la especialidad de ${especialidad}.`
        : "No hay medicos disponibles en este momento.";
    }

    const listaMedicos = medicos
      .map((m) => {
        const espec = m.especialidad?.nombre || "Sin especialidad registrada";
        return `- Dr/Dra. ${m.nombre}\n  Especialidad: ${espec}`;
      })
      .join("\n");

    return `Medicos disponibles${especialidad ? ` en ${especialidad}` : ""}:\n\n${listaMedicos}\n\nEscribe "solicitar cita" para agendar.`;
  } catch (error) {
    console.error("Error en consultar_medicos:", error);
    return "Lo siento, ocurrio un error al consultar los medicos.";
  }
};
