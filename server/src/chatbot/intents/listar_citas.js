import { obtenerCitasActivasPorTelefono } from "../../api/services/citasService.js";

const limpiarContextos = (queryResult) =>
  (queryResult.outputContexts || []).map((contexto) => ({
    name: contexto.name,
    lifespanCount: 0,
  }));

const resumenCita = (cita) => {
  const horario = cita.horario;
  const fecha = new Date(cita.fecha).toLocaleDateString("es-PE");
  return `${fecha} - Dr/a. ${horario.medico.nombre} (${horario.medico.especialidad.nombre}) - ${horario.diaSemana} ${horario.horaInicio}-${horario.horaFin}`;
};

export const procesarConsultarCitas = async (queryResult) => {
  const telefono = queryResult.telefonoUsuario;

  try {
    const citas = await obtenerCitasActivasPorTelefono(telefono);

    if (!citas.length) {
      return {
        text: "No tienes citas activas registradas. Necesitas algo mas?",
        contexts: limpiarContextos(queryResult),
      };
    }

    const lista = citas
      .map((cita, index) => `${index + 1}. ${resumenCita(cita)}`)
      .join("\n");

    return {
      text: `Estas son tus citas activas:\n\n${lista}\n\nNecesitas algo mas?`,
      contexts: limpiarContextos(queryResult),
    };
  } catch (error) {
    console.error("Error al consultar citas:", error);
    return {
      text: "Ocurrio un error al consultar tus citas. Intenta de nuevo mas tarde.",
      contexts: limpiarContextos(queryResult),
    };
  }
};