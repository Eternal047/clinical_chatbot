import { crearContextoIdentidad, obtenerContexto } from "../context.utils.js";

const obtenerNombre = (valor) => {
  if (!valor) return "";
  if (typeof valor === "string") return valor.trim();
  return String(valor.name || valor.nombre || valor.original || "").trim();
};

export const procesarProporcionarDatos = async (queryResult) => {
  const nombre = obtenerNombre(queryResult.parameters?.nombre_paciente);
  const dni = String(queryResult.parameters?.dni_paciente || "").trim();
  const contextoDatos = obtenerContexto(queryResult, "awaiting_datos_paciente");
  const contextParams = contextoDatos?.parameters || {};

  if (!nombre || !dni) {
    return {
      text: "Necesito ambos datos: nombre completo y DNI. Intenta nuevamente.",
      contexts: queryResult.outputContexts || [],
    };
  }

  if (!contextoDatos || !contextParams.horarioId) {
    return {
      text: "No encontre el horario seleccionado. Inicia la solicitud nuevamente.",
      contexts: [],
    };
  }

  const resumen =
    `Resumen de tu cita:\n` +
    `- Especialidad: ${contextParams.especialidad}\n` +
    `- Medico: Dr/a. ${contextParams.nombreMedico}\n` +
    `- Horario: ${contextParams.dia} de ${contextParams.horaInicio} a ${contextParams.horaFin}\n` +
    `- Paciente: ${nombre}\n` +
    `- DNI: ${dni}\n\n` +
    "Confirmas la cita? Responde Si o No.";

  const baseSession = contextoDatos.name.split("/contexts/")[0];
  const contextoIdentidad = crearContextoIdentidad(queryResult, {
    nombre_paciente: nombre,
    dni_paciente: dni,
  });

  return {
    text: resumen,
    contexts: [
      { name: contextoDatos.name, lifespanCount: 0 },
      ...(contextoIdentidad ? [contextoIdentidad] : []),
      {
        name: `${baseSession}/contexts/awaiting_confirmacion`,
        lifespanCount: 5,
        parameters: {
          ...contextParams,
          nombre_paciente: nombre,
          dni_paciente: dni,
        },
      },
    ],
  };
};
