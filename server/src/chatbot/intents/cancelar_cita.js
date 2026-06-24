import {
  cancelarCita,
  obtenerCitasActivasPorTelefono,
} from "../../api/services/citasService.js";

const limpiarContextos = (queryResult) =>
  (queryResult.outputContexts || []).map((contexto) => ({
    name: contexto.name,
    lifespanCount: 0,
  }));

const obtenerContexto = (queryResult, nombre) => {
  return (queryResult.outputContexts || []).find((contexto) =>
    contexto.name.endsWith(`/contexts/${nombre}`),
  );
};

const obtenerNumero = (queryResult) => {
  const numero = queryResult.parameters?.numero_seleccionado;
  if (typeof numero === "number") return numero;
  const match = String(numero || queryResult.queryText || "").match(/\d+/);
  return match ? Number(match[0]) : Number.NaN;
};

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

const resumenCita = (cita) => {
  const horario = cita.horario;
  const fecha = new Date(cita.fecha).toLocaleDateString("es-PE");
  return `${fecha} - Dr/a. ${horario.medico.nombre} (${horario.medico.especialidad.nombre}) - ${horario.diaSemana} ${horario.horaInicio}-${horario.horaFin}`;
};

export const procesarCancelarCita = async (queryResult) => {
  const intentName = queryResult.intent.displayName;
  const telefono = queryResult.telefonoUsuario;

  if (intentName === "cancelar_cita") {
    const citas = await obtenerCitasActivasPorTelefono(telefono);
    if (!citas.length) {
      return {
        text: "No tienes citas activas registradas. Necesitas algo mas?",
        contexts: limpiarContextos(queryResult),
      };
    }

    const opciones = citas.map((cita) => ({ id: cita.id, resumen: resumenCita(cita) }));
    const lista = opciones
      .map((cita, index) => `${index + 1}. ${cita.resumen}`)
      .join("\n");
    const baseSession = (queryResult.outputContexts?.[0]?.name || "").split("/contexts/")[0];

    return {
      text: `Tus citas activas:\n\n${lista}\n\nResponde con el numero de la cita que deseas cancelar.`,
      contexts: [
        ...limpiarContextos(queryResult),
        {
          name: `${baseSession}/contexts/awaiting_cancelacion_seleccion`,
          lifespanCount: 5,
          parameters: { citas: JSON.stringify(opciones), telefono },
        },
      ],
    };
  }

  if (intentName === "cancelar_cita - seleccionar") {
    const contexto = obtenerContexto(queryResult, "awaiting_cancelacion_seleccion");
    const citas = JSON.parse(contexto?.parameters?.citas || "[]");
    const numero = obtenerNumero(queryResult);

    if (!numero || numero < 1 || numero > citas.length) {
      return {
        text: "Numero invalido. Elige un numero de la lista.",
        contexts: queryResult.outputContexts || [],
      };
    }

    const seleccion = citas[numero - 1];
    const baseSession = contexto.name.split("/contexts/")[0];

    return {
      text: `Has seleccionado la cita:\n${seleccion.resumen}\n\nConfirmas que deseas cancelarla? Responde Si o No.`,
      contexts: [
        { name: contexto.name, lifespanCount: 0 },
        {
          name: `${baseSession}/contexts/awaiting_cancelacion_confirmacion`,
          lifespanCount: 3,
          parameters: { citaId: seleccion.id, resumen: seleccion.resumen, telefono },
        },
      ],
    };
  }

  if (intentName === "cancelar_cita - confirmar") {
    const confirmacion = normalizarConfirmacion(queryResult.parameters?.confirmacion);
    const contexto = obtenerContexto(queryResult, "awaiting_cancelacion_confirmacion");
    const citaId = contexto?.parameters?.citaId;
    const resumen = contexto?.parameters?.resumen;

    if (confirmacion !== "si") {
      return {
        text: "Cancelacion no realizada. Necesitas algo mas?",
        contexts: limpiarContextos(queryResult),
      };
    }

    try {
      await cancelarCita(citaId);
      return {
        text: `Cita cancelada con exito:\n${resumen}\nNecesitas algo mas?`,
        contexts: limpiarContextos(queryResult),
      };
    } catch (error) {
      console.error("Error al cancelar cita:", error);
      return {
        text: "Ocurrio un error al cancelar la cita. Intenta de nuevo mas tarde.",
        contexts: limpiarContextos(queryResult),
      };
    }
  }

  return { text: "No pude procesar la cancelacion.", contexts: limpiarContextos(queryResult) };
};