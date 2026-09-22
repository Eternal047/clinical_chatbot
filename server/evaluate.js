import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import dialogflow from "@google-cloud/dialogflow";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

let credentials;
try {
  credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON || "");
} catch {
  console.error("GOOGLE_CREDENTIALS_JSON no contiene un JSON válido.");
  process.exit(1);
}

const [, , datasetArgument, outputArgument] = process.argv;
const datasetPath = path.resolve(
  process.cwd(),
  datasetArgument || "../dataset/conversaciones_chatbot.json",
);
const outputPath = path.resolve(
  process.cwd(),
  outputArgument || "../dataset/resultados_evaluacion.json",
);
const projectId = process.env.DIALOGFLOW_PROJECT_ID || credentials.project_id;
const languageCode = "es";

if (!projectId) {
  console.error("Falta DIALOGFLOW_PROJECT_ID en las variables de entorno.");
  process.exit(1);
}

if (!fs.existsSync(datasetPath)) {
  console.error(`No existe el dataset: ${datasetPath}`);
  process.exit(1);
}

const sessionsClient = new dialogflow.SessionsClient({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
});

const decodeValue = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object") return value;
  if ("stringValue" in value) return value.stringValue;
  if ("numberValue" in value) return value.numberValue;
  if ("boolValue" in value) return value.boolValue;
  if ("nullValue" in value) return null;
  if (value.listValue) {
    return (value.listValue.values || []).map(decodeValue);
  }
  if (value.structValue) return decodeStruct(value.structValue);
  return value;
};

const decodeStruct = (struct) => {
  const fields = struct?.fields || {};
  return Object.fromEntries(
    Object.entries(fields).map(([name, value]) => [name, decodeValue(value)]),
  );
};

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const normalizeEntityValue = (value) => {
  if (value && typeof value === "object") {
    return value.name ?? value.nombre ?? value.original ?? value.value ?? "";
  }
  return value;
};

const entityMatches = (expected, actual) => {
  const normalizedActual = normalizeEntityValue(actual);
  if (
    normalizedActual === undefined ||
    normalizedActual === null ||
    normalizedActual === ""
  ) {
    return false;
  }
  if (expected === null) return false;
  if (typeof expected === "number") {
    return Number(normalizedActual) === expected;
  }
  return normalizeText(normalizedActual) === normalizeText(expected);
};

const isNonNluTurn = (turn) =>
  turn.input_type === "event" || turn.turn_role === "button";

const sendTextTurn = async (sessionId, text) => {
  const sessionPath = sessionsClient.projectAgentSessionPath(
    projectId,
    sessionId,
  );
  const [response] = await sessionsClient.detectIntent({
    session: sessionPath,
    queryInput: {
      text: { text: String(text || ""), languageCode },
    },
  });
  const queryResult = response.queryResult;
  return {
    actualIntent: queryResult.intent?.displayName || null,
    isFallback: Boolean(queryResult.intent?.isFallback),
    actualEntities: decodeStruct(queryResult.parameters),
    fulfillmentText: queryResult.fulfillmentText || "",
  };
};

const evaluateTurn = async (sessionId, turn) => {
  const expectedEntities = turn.expected_entities || {};
  const entitiesTotal = Object.keys(expectedEntities).length;

  if (isNonNluTurn(turn)) {
    return {
      turn_number: turn.turn_number,
      input_type: "event",
      user_utterance: turn.user_utterance || null,
      expected_intent: turn.expected_intent,
      actual_intent: `event:${turn.expected_intent}`,
      intent_correct: true,
      expected_entities: expectedEntities,
      actual_entities: {},
      entities_correct: 0,
      entities_total: entitiesTotal,
      expected_fallback: false,
      actual_fallback: false,
      nlu_evaluated: false,
      note: "Turno de boton Meta excluido de NLU; requiere prueba del webhook Meta.",
    };
  }

  try {
    const result = await sendTextTurn(sessionId, turn.user_utterance);
    const expectedFallback = turn.expected_intent === "fallback";
    const intentCorrect = expectedFallback
      ? result.isFallback
      : !result.isFallback && result.actualIntent === turn.expected_intent;
    const entityKeys = Object.keys(expectedEntities);
    const entitiesCorrect = entityKeys.filter((key) =>
      entityMatches(expectedEntities[key], result.actualEntities[key]),
    ).length;

    return {
      turn_number: turn.turn_number,
      input_type: "text",
      user_utterance: turn.user_utterance,
      expected_intent: turn.expected_intent,
      actual_intent: result.isFallback ? "fallback" : result.actualIntent,
      intent_correct: intentCorrect,
      expected_entities: expectedEntities,
      actual_entities: result.actualEntities,
      entities_correct: entitiesCorrect,
      entities_total: entitiesTotal,
      expected_fallback: expectedFallback,
      actual_fallback: result.isFallback,
      nlu_evaluated: true,
      fulfillment_text: result.fulfillmentText,
    };
  } catch (error) {
    return {
      turn_number: turn.turn_number,
      input_type: "text",
      user_utterance: turn.user_utterance,
      expected_intent: turn.expected_intent,
      actual_intent: null,
      intent_correct: false,
      expected_entities: expectedEntities,
      actual_entities: {},
      entities_correct: 0,
      entities_total: entitiesTotal,
      expected_fallback: turn.expected_intent === "fallback",
      actual_fallback: null,
      nlu_evaluated: true,
      error: error.message,
    };
  }
};

const evaluateConversation = async (conversation) => {
  const sessionId = `eval-${conversation.conversation_id}-${Date.now()}`;
  const turns = [];

  for (const turn of conversation.turns || []) {
    turns.push(await evaluateTurn(sessionId, turn));
  }

  const evaluableTurns = turns.filter((turn) => turn.nlu_evaluated);
  const conversationSuccess = evaluableTurns.every(
    (turn) =>
      turn.intent_correct && turn.entities_correct === turn.entities_total,
  );

  return {
    conversation_id: conversation.conversation_id,
    primary_category: conversation.primary_category,
    subcategory: conversation.subcategory,
    case_type: conversation.case_type,
    border_case_type: conversation.border_case_type,
    expected_final_outcome: conversation.expected_final_outcome,
    conversation_success: conversationSuccess,
    turns,
  };
};

const summarize = (conversationResults) => {
  const allTurns = conversationResults.flatMap(
    (conversation) => conversation.turns,
  );
  const nluTurns = allTurns.filter((turn) => turn.nlu_evaluated && !turn.error);
  const intentCorrect = nluTurns.filter((turn) => turn.intent_correct).length;
  const entityTurns = nluTurns.filter((turn) => turn.entities_total > 0);
  const entitiesCorrect = entityTurns.reduce(
    (sum, turn) => sum + turn.entities_correct,
    0,
  );
  const entitiesTotal = entityTurns.reduce(
    (sum, turn) => sum + turn.entities_total,
    0,
  );
  const expectedFallbackTurns = nluTurns.filter(
    (turn) => turn.expected_fallback,
  );
  const correctlyDetectedFallbacks = expectedFallbackTurns.filter(
    (turn) => turn.actual_fallback,
  ).length;
  const validTurns = nluTurns.filter((turn) => !turn.expected_fallback);
  const falseFallbacks = validTurns.filter(
    (turn) => turn.actual_fallback,
  ).length;

  return {
    total_conversations: conversationResults.length,
    total_turns: allTurns.length,
    turnos_nlu_evaluados: nluTurns.length,
    turnos_evento_excluidos_nlu: allTurns.length - nluTurns.length,
    intent_accuracy: nluTurns.length ? intentCorrect / nluTurns.length : null,
    entity_extraction_accuracy: entitiesTotal
      ? entitiesCorrect / entitiesTotal
      : null,
    fallback_recall_en_casos_marcados: expectedFallbackTurns.length
      ? correctlyDetectedFallbacks / expectedFallbackTurns.length
      : null,
    tasa_falsos_fallback_en_casos_validos: validTurns.length
      ? falseFallbacks / validTurns.length
      : null,
    flow_success_rate: conversationResults.length
      ? conversationResults.filter(
          (conversation) => conversation.conversation_success,
        ).length / conversationResults.length
      : null,
    nota_flujo:
      "Los turnos de boton se excluyen de NLU y se validan en una prueba separada contra Meta/webhook.",
  };
};

const collectErrors = (conversationResults) =>
  conversationResults.flatMap((conversation) =>
    conversation.turns
      .filter(
        (turn) =>
          turn.nlu_evaluated &&
          (turn.error ||
            !turn.intent_correct ||
            turn.entities_correct < turn.entities_total),
      )
      .map((turn) => ({
        conversation_id: conversation.conversation_id,
        turn: turn.turn_number,
        tipo_error: turn.error
          ? "error_api"
          : !turn.intent_correct && turn.entities_correct < turn.entities_total
            ? "intent_y_entidades"
            : !turn.intent_correct
              ? "intent"
              : "entidades",
        detalle: turn.error || undefined,
        user_utterance: turn.user_utterance,
        expected_intent: turn.expected_intent,
        actual_intent: turn.actual_intent,
        expected_entities: turn.expected_entities,
        actual_entities: turn.actual_entities,
      })),
  );

const main = async () => {
  const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
  const conversations = [];

  for (const conversation of dataset) {
    console.log(`Evaluando ${conversation.conversation_id}...`);
    conversations.push(await evaluateConversation(conversation));
  }

  const metrics = summarize(conversations);
  const errors = collectErrors(conversations);
  const output = { metrics, errors, conversations };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log("\n=== Métricas ===");
  console.table(metrics);
  console.log(`\nErrores detectados: ${errors.length}`);
  console.log(`Resultados guardados en: ${outputPath}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
