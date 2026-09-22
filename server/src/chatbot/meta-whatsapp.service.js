import config from "../config/env.js";
import { detectIntentService } from "./dialogflow.service.js";
import {
  procesarCambiarEspecialidad,
  procesarCambiarHorario,
  procesarCancelarProceso,
} from "./intents/confirmar_cita.js";

const normalizarTelefono = (telefono) =>
  String(telefono || "").replace(/\D/g, "");

const obtenerMensajesEntrantes = (payload) =>
  (payload.entry || []).flatMap((entry) =>
    (entry.changes || []).flatMap((change) => change.value?.messages || []),
  );

const crearSessionId = (telefono) => `wa_${normalizarTelefono(telefono)}`;
const sesionesMeta = new Map();

const normalizarValorDialogflow = (valor) => {
  if (!valor || typeof valor !== "object") return valor;
  if (Object.prototype.hasOwnProperty.call(valor, "stringValue")) {
    return valor.stringValue;
  }
  if (Object.prototype.hasOwnProperty.call(valor, "numberValue")) {
    return valor.numberValue;
  }
  if (Object.prototype.hasOwnProperty.call(valor, "boolValue")) {
    return valor.boolValue;
  }
  if (Object.prototype.hasOwnProperty.call(valor, "nullValue")) {
    return null;
  }
  if (valor.structValue?.fields) {
    return normalizarCamposDialogflow(valor.structValue.fields);
  }
  if (valor.listValue?.values) {
    return valor.listValue.values.map(normalizarValorDialogflow);
  }
  return valor;
};

const normalizarCamposDialogflow = (campos = {}) =>
  Object.fromEntries(
    Object.entries(campos).map(([nombre, valor]) => [
      nombre,
      normalizarValorDialogflow(valor),
    ]),
  );

const normalizarContextoDialogflow = (contexto) => ({
  name: contexto.name,
  lifespanCount: contexto.lifespanCount,
  ...(contexto.parameters?.fields
    ? { parameters: normalizarCamposDialogflow(contexto.parameters.fields) }
    : { parameters: contexto.parameters || {} }),
});

const contextosActivos = (contextos = []) =>
  contextos
    .filter((contexto) => contexto?.name && contexto.lifespanCount !== 0)
    .map(normalizarContextoDialogflow);

const extraerDatosPaciente = (contextos = []) => {
  const contexto = contextos.find(
    (item) =>
      item?.parameters?.nombre_paciente && item?.parameters?.dni_paciente,
  );

  return contexto
    ? {
        nombre_paciente: contexto.parameters.nombre_paciente,
        dni_paciente: contexto.parameters.dni_paciente,
      }
    : {};
};

const esContextoIdentidad = (contexto) =>
  contexto.name?.endsWith("/contexts/paciente_identidad");

const conservarDatosPaciente = (contextos = [], datosPaciente = {}) =>
  contextosActivos(contextos).map((contexto) => {
    if (!esContextoIdentidad(contexto) || !tieneDatosPaciente(datosPaciente)) {
      return contexto;
    }

    return {
      ...contexto,
      lifespanCount: Math.max(contexto.lifespanCount || 0, 10),
      parameters: {
        ...(contexto.parameters || {}),
        ...datosPaciente,
      },
    };
  });

const tieneDatosPaciente = (datosPaciente = {}) =>
  Boolean(datosPaciente.nombre_paciente && datosPaciente.dni_paciente);

const obtenerPayloadInteractivo = (queryResult) => {
  const payload = queryResult?.webhookPayload || queryResult?.payload;
  if (!payload) return null;
  if (payload.interactive) return payload.interactive;
  const fields = payload.fields?.interactive?.structValue?.fields;
  if (fields) {
    const texto = fields.body?.stringValue;
    const botones = fields.buttons?.listValue?.values || [];
    return {
      body: texto,
      buttons: botones.map((boton) => ({
        id: boton.structValue?.fields?.id?.stringValue,
        title: boton.structValue?.fields?.title?.stringValue,
      })),
    };
  }
  return null;
};

const enviarRespuestaMeta = async (telefono, respuesta) => {
  if (respuesta.interactive) {
    await enviarMensajeInteractivo(
      telefono,
      respuesta.interactive.body,
      respuesta.interactive.buttons,
    );
    return;
  }

  await enviarMensajeTexto(telefono, respuesta.text);
};

export const enviarMensajeTexto = async (telefono, texto) => {
  const destinatario = normalizarTelefono(telefono);
  const url = `https://graph.facebook.com/${config.metaWhatsApp.graphApiVersion}/${config.metaWhatsApp.phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.metaWhatsApp.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: destinatario,
      type: "text",
      text: { body: texto, preview_url: false },
    }),
  });

  if (!response.ok) {
    const detalle = await response.text();
    throw new Error(
      `Meta no pudo enviar el mensaje (${response.status}): ${detalle}`,
    );
  }
};

export const enviarMensajeInteractivo = async (telefono, cuerpo, botones) => {
  if (
    !cuerpo ||
    !Array.isArray(botones) ||
    botones.length < 1 ||
    botones.length > 3
  ) {
    throw new Error("Un mensaje interactivo requiere entre 1 y 3 botones");
  }
  if (
    botones.some(
      (boton) => !boton.id || !boton.title || boton.title.length > 20,
    )
  ) {
    throw new Error("Cada boton requiere id y un title de hasta 20 caracteres");
  }

  const destinatario = normalizarTelefono(telefono);
  const url = `https://graph.facebook.com/${config.metaWhatsApp.graphApiVersion}/${config.metaWhatsApp.phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.metaWhatsApp.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: destinatario,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: cuerpo },
        action: {
          buttons: botones.map(({ id, title }) => ({
            type: "reply",
            reply: { id, title },
          })),
        },
      },
    }),
  });

  if (!response.ok) {
    const detalle = await response.text();
    throw new Error(
      `Meta no pudo enviar el mensaje interactivo (${response.status}): ${detalle}`,
    );
  }
};

const procesarBoton = async (telefono, botonId, contextos) => {
  const session = contextos
    .find((contexto) => contexto?.name)
    ?.name?.split("/contexts/")[0];
  const queryResult = {
    session,
    outputContexts: contextos,
    telefonoUsuario: `+${normalizarTelefono(telefono)}`,
  };
  const contextoConfirmacion = contextos.find((contexto) =>
    contexto.name.endsWith("/contexts/awaiting_confirmacion"),
  );

  if (!contextoConfirmacion) {
    return {
      text: "La confirmacion expiro. Inicia nuevamente la solicitud de cita.",
      contexts: [],
    };
  }

  if (botonId === "cambiar_horario") {
    return procesarCambiarHorario(queryResult);
  }

  if (botonId === "cambiar_especialidad") {
    return procesarCambiarEspecialidad(queryResult);
  }

  if (botonId === "cancelar_proceso") {
    return procesarCancelarProceso(queryResult);
  }

  return {
    text: "No reconoci esa opcion. Inicia nuevamente la solicitud.",
    contexts: [],
  };
};

export const procesarEventoMeta = async (payload) => {
  const mensajes = obtenerMensajesEntrantes(payload);

  for (const mensaje of mensajes) {
    if (!mensaje.from) {
      continue;
    }

    const sessionId = crearSessionId(mensaje.from);
    const estadoAnterior = sesionesMeta.get(sessionId);

    if (
      mensaje.type === "interactive" &&
      mensaje.interactive?.type === "button_reply"
    ) {
      const botonId = mensaje.interactive.button_reply.id;
      const respuesta = await procesarBoton(
        mensaje.from,
        botonId,
        estadoAnterior?.outputContexts || [],
      );
      const datosPaciente = tieneDatosPaciente(estadoAnterior?.datosPaciente)
        ? estadoAnterior.datosPaciente
        : extraerDatosPaciente(respuesta.contexts);
      const contextosRespuesta = conservarDatosPaciente(
        respuesta.contexts || [],
        datosPaciente,
      );
      sesionesMeta.set(sessionId, {
        outputContexts: contextosRespuesta,
        datosPaciente,
      });
      respuesta.contexts = contextosRespuesta;
      await enviarRespuestaMeta(mensaje.from, respuesta);
      continue;
    }

    if (mensaje.type !== "text" || !mensaje.text?.body) {
      continue;
    }

    const contextosEntrada = conservarDatosPaciente(
      estadoAnterior?.outputContexts || [],
      estadoAnterior?.datosPaciente || {},
    );
    const queryResult = await detectIntentService(
      sessionId,
      mensaje.text.body,
      "es",
      contextosEntrada,
    );
    const interactive = obtenerPayloadInteractivo(queryResult);
    const datosPaciente = tieneDatosPaciente(estadoAnterior?.datosPaciente)
      ? estadoAnterior.datosPaciente
      : extraerDatosPaciente(queryResult.outputContexts);
    const contextosRespuesta = conservarDatosPaciente(
      queryResult.outputContexts || [],
      datosPaciente,
    );
    const respuesta = {
      text:
        queryResult.fulfillmentText || "No tengo respuesta en este momento.",
      interactive,
      contexts: contextosRespuesta,
    };

    sesionesMeta.set(sessionId, {
      outputContexts: respuesta.contexts,
      datosPaciente,
    });
    await enviarRespuestaMeta(mensaje.from, respuesta);
  }
};
