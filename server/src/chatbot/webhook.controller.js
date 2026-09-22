// src/chatbot/webhook.controller.js
import { procesarSolicitarCita } from "./intents/solicitar_cita.js";
import { procesarSeleccionarEspecialidad } from "./intents/seleccionar_especialidad.js";
import { procesarSeleccionarMedico } from "./intents/seleccionar_medico.js";
import { procesarProporcionarDatos } from "./intents/proporcionar_datos.js";
import { procesarConfirmarCita } from "./intents/confirmar_cita.js";
import { procesarCancelarCita } from "./intents/cancelar_cita.js"; // unificado
import { procesarReprogramarCita } from "./intents/reprogramar_cita.js";
import { procesarConsultarCitas } from "./intents/listar_citas.js"; // nuevo
import { procesarConsultarEspecialidades } from "./intents/consultar_especialidades.js";
import { procesarSeleccionarEspecialidadInfo } from "./intents/seleccionar_especialidad_info.js";


// Mapeo de intents → handlers
const intentHandlers = {
  solicitar_cita: procesarSolicitarCita,
  seleccionar_especialidad: procesarSeleccionarEspecialidad,
  seleccionar_medico: procesarSeleccionarMedico,
  proporcionar_datos: procesarProporcionarDatos,
  confirmar_cita: procesarConfirmarCita,

  // Los tres intents de cancelación comparten el mismo handler
  cancelar_cita: procesarCancelarCita,
  "cancelar_cita - seleccionar": procesarCancelarCita,
  "cancelar_cita - confirmar": procesarCancelarCita,
  // ... otros
  reprogramar_cita: procesarReprogramarCita,
  "reprogramar_cita - seleccionar": procesarReprogramarCita,
  "reprogramar_cita - horario": procesarReprogramarCita,
  "reprogramar_cita - confirmar": procesarReprogramarCita,
  consultar_citas: procesarConsultarCitas,
  consultar_especialidades: procesarConsultarEspecialidades,
  "consultar_especialidades - seleccionar": procesarSeleccionarEspecialidadInfo,
};

/**
 * Extrae el número de teléfono limpio desde el session de Dialogflow.
 * Ejemplo: "whatsapp:+51961219063" → "961219063"
 */
const extraerTelefonoDeSession = (session) => {
  const raw = String(session || "").split("/").at(-1);
  const match = raw.match(/^wa_(\d{7,15})$/);

  // Si no viene en formato whatsapp:+..., es una sesión de prueba (consola de Dialogflow)
  if (match) {
    return `+${match[1]}`;
  }

  return "+51999999999";
};

export const handleWebhook = async (req, res) => {
  const { queryResult } = req.body;
  const intentName = queryResult.intent.displayName;
  const handler = intentHandlers[intentName];

  // 🔍 Log de depuración
  console.log("[Webhook] Intent recibido:", intentName);
  //console.log('Teléfono extraído:', extraerTelefonoDeSession(req.body.session));
  console.log("Texto del usuario:", queryResult.queryText);
  console.log("Parámetros (raw):", queryResult.parameters);
  //console.log('Todos los parámetros requeridos completos?:', queryResult.allRequiredParamsPresent);

  if (!handler) {
    console.warn("⚠️ No se encontró handler para el intent:", intentName);
    return res.json({
      fulfillmentText: "No tengo una respuesta para esta solicitud.",
    });
  }

  try {
    // Inyectar el número de teléfono limpio en queryResult
    queryResult.telefonoUsuario = extraerTelefonoDeSession(req.body.session);
    const result = await handler(queryResult);

    console.log("✅ Respuesta del handler:", {
      intent: intentName,
      text: result.text?.substring(0, 300),
      contexts: result.contexts?.length || 0,
    });

    return res.json({
      fulfillmentText: result.text,
      outputContexts: result.contexts || [],
    });
  } catch (error) {
    console.error(`💥 Error en intent ${intentName}:`, error);
    return res.json({
      fulfillmentText: "Error interno. Por favor inténtalo más tarde.",
    });
  }
};
