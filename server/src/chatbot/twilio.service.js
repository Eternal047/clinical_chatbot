// src/twilio.service.js
import { detectIntentService } from './dialogflow.service.js';

const escaparXML = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const formatearTwiML = (mensaje) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escaparXML(mensaje)}</Message>
</Response>`;
};

export const handleIncomingMessage = async (req, res) => {
  const { Body, From } = req.body;
  console.log('📨 [Twilio] Procesando mensaje:', { From, Body });

  try {
    // ✅ Orden correcto: (sessionId, mensaje)
    const queryResult = await detectIntentService(From, Body);
    console.log('🤖 [Dialogflow] queryResult:', JSON.stringify(queryResult, null, 2));

    const respuesta = queryResult.fulfillmentText;
    console.log('📤 [Twilio] Respuesta a enviar:', respuesta);

    const twiml = formatearTwiML(respuesta || 'No tengo respuesta en este momento.');
    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('💥 Error en Twilio:', error);
    res.type('text/xml');
    res.send(formatearTwiML('Error interno. Intenta de nuevo.'));
  }
};