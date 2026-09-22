import { crearCita } from "../../api/services/citasService.js";
import { mostrarEspecialidades, mostrarMedicos } from "./solicitar_cita.js";
import {
  limpiarContextos,
  obtenerContexto,
  obtenerDatosPaciente,
} from "../context.utils.js";

const normalizarConfirmacion = (valor) => {
  const texto = Array.isArray(valor)
    ? valor[0]
    : typeof valor === "string"
      ? valor
      : valor?.value || valor?.stringValue || "";

  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const procesarCambiarHorario = async (queryResult) => {
  const contextoConfirmacion = obtenerContexto(
    queryResult,
    "awaiting_confirmacion",
  );
  const { especialidad } = contextoConfirmacion?.parameters || {};
  const telefono =
    contextoConfirmacion?.parameters?.telefono || queryResult.telefonoUsuario;

  if (!contextoConfirmacion || !especialidad) {
    return {
      text: "No pude recuperar la especialidad de la cita. Inicia nuevamente la solicitud.",
      contexts: limpiarContextos(queryResult),
    };
  }

  return mostrarMedicos(
    especialidad,
    telefono,
    queryResult,
    obtenerDatosPaciente(queryResult),
  );
};

export const procesarCambiarEspecialidad = async (queryResult) => {
  const contextoConfirmacion = obtenerContexto(
    queryResult,
    "awaiting_confirmacion",
  );
  const telefono =
    contextoConfirmacion?.parameters?.telefono || queryResult.telefonoUsuario;

  if (!contextoConfirmacion) {
    return {
      text: "No pude recuperar los datos de la cita. Inicia nuevamente la solicitud.",
      contexts: limpiarContextos(queryResult),
    };
  }

  return mostrarEspecialidades(telefono, queryResult);
};

export const procesarCancelarProceso = (queryResult) => {
  const contextoIdentidad = obtenerContexto(queryResult, "paciente_identidad");
  const contextosParaLimpiar = (queryResult.outputContexts || []).filter(
    (contexto) => !contexto.name.endsWith("/contexts/paciente_identidad"),
  );

  return {
    text: "Proceso cancelado. Necesitas algo mas?",
    contexts: [
      ...limpiarContextos({ outputContexts: contextosParaLimpiar }),
      ...(contextoIdentidad
        ? [{ ...contextoIdentidad, lifespanCount: 10 }]
        : []),
    ],
  };
};

export const procesarConfirmarCita = async (queryResult) => {
  const confirmacion = normalizarConfirmacion(
    queryResult.parameters?.confirmacion,
  );
  const contextoConfirmacion = obtenerContexto(
    queryResult,
    "awaiting_confirmacion",
  );
  const contextParams = contextoConfirmacion?.parameters || {};

  if (!contextoConfirmacion) {
    return {
      text: "La confirmacion expiro. Inicia nuevamente la solicitud de cita.",
      contexts: [],
    };
  }

  if (confirmacion === "no") {
    return {
      text: "Que deseas hacer con la cita?",
      interactive: {
        body: "Elige una opcion para continuar.",
        buttons: [
          { id: "cambiar_horario", title: "Cambiar horario" },
          { id: "cambiar_especialidad", title: "Cambiar especialidad" },
          { id: "cancelar_proceso", title: "Cancelar proceso" },
        ],
      },
      contexts: queryResult.outputContexts || [],
    };
  }

  if (confirmacion !== "si") {
    return {
      text: "No entendi la confirmacion. Responde Si o No.",
      contexts: queryResult.outputContexts || [],
    };
  }

  const { horarioId, nombre_paciente, dni_paciente, telefono } = contextParams;

  if (!horarioId || !nombre_paciente || !dni_paciente || !telefono) {
    return {
      text: "Faltan datos para confirmar la cita. Por favor, inicia de nuevo.",
      contexts: limpiarContextos(queryResult),
    };
  }

  try {
    const cita = await crearCita({
      horarioId,
      pacienteNombre: nombre_paciente,
      pacienteDni: dni_paciente,
      pacienteTelef: telefono,
    });

    return {
      text: `Cita registrada con exito. Gracias por tu preferencia, ${cita.pacienteNombre}. Te esperamos en la fecha y hora acordadas.`,
      contexts: limpiarContextos(queryResult),
    };
  } catch (error) {
    console.error("Error al guardar cita:", error);
    if (error.code === "SLOT_UNAVAILABLE") {
      return {
        text: "Lo siento, ese horario acaba de ocuparse. Elige otro horario para continuar.",
        contexts: [],
      };
    }
    return {
      text: "Ocurrio un error al registrar la cita. Por favor intentalo mas tarde.",
      contexts: limpiarContextos(queryResult),
    };
  }
};
