import crypto from "node:crypto";
import config from "../config/env.js";
import { procesarEventoMeta } from "./meta-whatsapp.service.js";

const firmaValida = (firma, cuerpo) => {
  if (!firma || !cuerpo) return false;

  const esperada = `sha256=${crypto
    .createHmac("sha256", config.metaWhatsApp.appSecret)
    .update(cuerpo)
    .digest("hex")}`;
  const firmaRecibida = Buffer.from(firma);
  const firmaEsperada = Buffer.from(esperada);

  return (
    firmaRecibida.length === firmaEsperada.length &&
    crypto.timingSafeEqual(firmaRecibida, firmaEsperada)
  );
};

export const verifyMetaWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.metaWhatsApp.verifyToken && challenge) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

export const handleMetaWebhook = (req, res) => {
  console.log("🔥 META WEBHOOK RECIBIDO");
  const signature = req.get("x-hub-signature-256");

  if (!firmaValida(signature, req.rawBody)) {
    return res.sendStatus(401);
  }

  if (req.body?.object !== "whatsapp_business_account") {
    return res.sendStatus(404);
  }

  // Meta debe recibir confirmacion antes de procesar Dialogflow y la respuesta saliente.
  res.sendStatus(200);
  procesarEventoMeta(req.body).catch((error) => {
    console.error("Error al procesar webhook de Meta:", error);
  });
};
