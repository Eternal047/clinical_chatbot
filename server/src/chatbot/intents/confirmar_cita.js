import { crearCita } from "../../api/services/citasService.js";
import { mostrarMedicos } from "./solicitar_cita.js";

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

const obtenerContexto = (queryResult, nombre) => {
  return (queryResult.outputContexts || []).find((contexto) =>
    contexto.name.endsWith(`/contexts/${nombre}`),
  );
};

const limpiarContextos = (queryResult) =>
  (queryResult.outputContexts || []).map((contexto) => ({
    name: contexto.name,
    lifespanCount: 0,
  }));

export const procesarConfirmarCita = async (queryResult) => {
  const confirmacion = queryResult.parameters?.confirmacion
  const contextoConfirmacion = obtenerContexto(queryResult, "awaiting_confirmacion");
  const contextParams = contextoConfirmacion?.parameters || {};

  if (confirmacion === "no") {
    return mostrarMedicos(contextParams.especialidad, contextParams.telefono, queryResult);
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
    return {
      text: "Ocurrio un error al registrar la cita. Por favor intentalo mas tarde.",
      contexts: limpiarContextos(queryResult),
    };
  }
};