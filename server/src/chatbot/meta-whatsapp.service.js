import config from "../config/env.js";
import { detectIntentService } from "./dialogflow.service.js";

const normalizarTelefono = (telefono) => String(telefono || "").replace(/\D/g, "");

const obtenerMensajesEntrantes = (payload) =>
  (payload.entry || []).flatMap((entry) =>
    (entry.changes || []).flatMap((change) => change.value?.messages || []),
  );

const crearSessionId = (telefono) => `wa_${normalizarTelefono(telefono)}`;

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
    throw new Error(`Meta no pudo enviar el mensaje (${response.status}): ${detalle}`);
  }
};

export const procesarEventoMeta = async (payload) => {
  const mensajes = obtenerMensajesEntrantes(payload);

  for (const mensaje of mensajes) {
    if (mensaje.type !== "text" || !mensaje.text?.body || !mensaje.from) {
      continue;
    }

    const queryResult = await detectIntentService(
      crearSessionId(mensaje.from),
      mensaje.text.body,
    );
    const respuesta = queryResult.fulfillmentText || "No tengo respuesta en este momento.";

    await enviarMensajeTexto(mensaje.from, respuesta);
  }
};
