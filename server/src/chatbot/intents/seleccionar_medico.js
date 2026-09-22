import { crearContextoIdentidad, obtenerContexto } from "../context.utils.js";

const obtenerNumero = (queryResult) => {
  const numero = queryResult.parameters?.numero_seleccionado;
  if (typeof numero === "number") return numero;
  const match = String(numero || queryResult.queryText || "").match(/\d+/);
  return match ? Number(match[0]) : Number.NaN;
};

export const procesarSeleccionarMedico = async (queryResult) => {
  const contextoSeleccion = obtenerContexto(
    queryResult,
    "awaiting_medico_selection",
  );
  if (!contextoSeleccion) {
    return {
      text: "La seleccion de horario expiro. Inicia nuevamente la solicitud de cita.",
      contexts: [],
    };
  }

  const contextParams = contextoSeleccion?.parameters || {};
  let opciones;
  try {
    opciones = JSON.parse(contextParams.opciones || "[]");
  } catch {
    return {
      text: "No pude recuperar los horarios de esta solicitud. Inicia nuevamente.",
      contexts: [],
    };
  }
  const numero = obtenerNumero(queryResult);

  if (!opciones.length) {
    return {
      text: "No tengo horarios cargados para esta sesion. Inicia la solicitud nuevamente.",
      contexts: [],
    };
  }

  if (!numero || numero < 1 || numero > opciones.length) {
    return {
      text: "Numero invalido. Por favor, elige uno de la lista.",
      contexts: queryResult.outputContexts || [],
    };
  }

  const seleccion = opciones[numero - 1];
  const baseSession = contextoSeleccion.name.split("/contexts/")[0];
  const datosPaciente = {
    nombre_paciente: contextParams.nombre_paciente || "",
    dni_paciente: contextParams.dni_paciente || "",
  };
  const nuevoContexto = {
    name: `${baseSession}/contexts/awaiting_datos_paciente`,
    lifespanCount: 5,
    parameters: {
      horarioId: seleccion.horarioId,
      medicoId: seleccion.medicoId,
      nombreMedico: seleccion.nombreMedico,
      dia: seleccion.dia,
      horaInicio: seleccion.horaInicio,
      horaFin: seleccion.horaFin,
      especialidad: contextParams.especialidad,
      telefono: contextParams.telefono,
      ...datosPaciente,
    },
  };
  const contextoIdentidad = crearContextoIdentidad(queryResult, datosPaciente);

  if (datosPaciente.nombre_paciente && datosPaciente.dni_paciente) {
    return {
      text:
        `Has seleccionado:\n` +
        `Dr/a. ${seleccion.nombreMedico}\n` +
        `${seleccion.dia} de ${seleccion.horaInicio} a ${seleccion.horaFin}\n\n` +
        `Paciente: ${datosPaciente.nombre_paciente}\n` +
        `DNI: ${datosPaciente.dni_paciente}\n\n` +
        "Confirmas la cita?",
      contexts: [
        { name: contextoSeleccion.name, lifespanCount: 0 },
        ...(contextoIdentidad ? [contextoIdentidad] : []),
        {
          name: `${baseSession}/contexts/awaiting_confirmacion`,
          lifespanCount: 5,
          parameters: nuevoContexto.parameters,
        },
      ],
    };
  }

  return {
    text:
      `Has seleccionado:\n` +
      `Dr/a. ${seleccion.nombreMedico}\n` +
      `${seleccion.dia} de ${seleccion.horaInicio} a ${seleccion.horaFin}\n\n` +
      "Ahora necesito tu nombre completo y DNI.",
    contexts: [
      { name: contextoSeleccion.name, lifespanCount: 0 },
      ...(contextoIdentidad ? [contextoIdentidad] : []),
      nuevoContexto,
    ],
  };
};
