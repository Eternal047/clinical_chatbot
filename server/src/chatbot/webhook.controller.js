import { procesarSolicitarCita } from './intents/solicitar_cita.js';
import { procesarSeleccionarMedico } from './intents/seleccionar_medico.js';
import { procesarProporcionarDatos } from './intents/proporcionar_datos.js';
import { procesarConfirmarCita } from './intents/confirmar_cita.js';
// Luego agregarás otros: cancelar_cita, reprogramar_cita, etc.

const intentHandlers = {
  'solicitar_cita': procesarSolicitarCita,
  'seleccionar_medico': procesarSeleccionarMedico,
  'proporcionar_datos': procesarProporcionarDatos,
  'confirmar_cita': procesarConfirmarCita,
};

// Extrae el número de teléfono del session (formato: projects/*/agent/sessions/<tel>)
const extraerTelefonoDeSession = (session) => {
  const parts = session.split('/');
  return parts[parts.length - 1];
};

export const handleWebhook = async (req, res) => {
    console.log('🤖 [Webhook] Body recibido:', JSON.stringify(req.body).slice(0, 200));
  if (!req.body?.queryResult) {
    console.error('❌ Petición inválida al webhook (no es de Dialogflow)');
    return res.status(400).send('Bad Request');
  }
  const { queryResult } = req.body;
  const intentName = queryResult.intent.displayName;
  const handler = intentHandlers[intentName];

  if (!handler) {
    return res.json({ fulfillmentText: 'No tengo una respuesta para esta solicitud.' });
  }

  try {
    // Inyectamos el número de teléfono en queryResult para que los intents puedan usarlo
    queryResult.telefonoUsuario = extraerTelefonoDeSession(req.body.session);
    const result = await handler(queryResult);
    return res.json({
      fulfillmentText: result.text,
      outputContexts: result.contexts || [],
    });
  } catch (error) {
    console.error(`Error en intent ${intentName}:`, error);
    return res.json({ fulfillmentText: 'Error interno. Por favor inténtalo más tarde.' });
  }
};