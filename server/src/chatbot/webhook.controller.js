import { detectIntentService } from "./dialogflow.service.js";
import { formatearTwiML } from "./twilio.service.js";

// Import handlers
import solicitar_cita from "./intents/solicitar_cita.js";
import cancelar_cita from "./intents/cancelar_cita.js";
import reprogramar_cita from "./intents/reprogramar_cita.js";
import consultar_disponibilidad from "./intents/consultar_disponibilidad.js";
import consultar_medicos from "./intents/consultar_medicos.js";
import consultar_especialidades from "./intents/consultar_especialidades.js";
import faq from "./intents/faq.js";

const intentHandlers = {
  solicitar_cita: solicitar_cita,
  cancelar_cita: cancelar_cita,
  reprogramar_cita: reprogramar_cita,
  consultar_disponibilidad: consultar_disponibilidad,
  consultar_medicos: consultar_medicos,
  consultar_especialidades: consultar_especialidades,
  faq: faq,
};

export const handleWebhook = async (req, res) => {
  try {
    const { Body: mensaje, From: telefono } = req.body;

    if (!mensaje || !telefono) {
      return res.status(400).json({ error: "Body y From son requeridos" });
    }

    // Detectar intención con Dialogflow
    const detectionResult = await detectIntentService(mensaje, telefono);
    console.log("Intent detectado:", detectionResult.intent);
    console.log("Parámetros:", detectionResult.parameters);
    const handler = intentHandlers[detectionResult.intent];

    let respuesta;

    // Si los parámetros están incompletos, usar el fulfillmentText de Dialogflow
    const parametrosCompletos = Object.values(detectionResult.parameters).every(
      (v) => v !== undefined && v !== "",
    );

    if (handler && parametrosCompletos) {
      respuesta = await handler(detectionResult.parameters);
    } else {
      respuesta = detectionResult.fulfillmentText;
    }

    // Formatear y retornar como TwiML
    const twiml = formatearTwiML(respuesta);
    res.type("application/xml").send(twiml);
  } catch (error) {
    console.error("Error en handleWebhook:", error);
    const twiml = formatearTwiML(
      "Ocurrió un error procesando tu solicitud. Por favor intenta más tarde.",
    );
    res.type("application/xml").send(twiml);
  }
};
