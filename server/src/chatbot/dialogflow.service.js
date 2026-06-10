import dialogflow from "@google-cloud/dialogflow";
import config from "../config/env.js";

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

const projectId = credentials.project_id;

const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
});

export const detectIntentService = async (mensaje, telefonoUsuario) => {
  console.log("Session ID usado:", telefonoUsuario);
  try {
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      telefonoUsuario,
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: mensaje,
          languageCode: "es",
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    console.log("RAW parameters:", JSON.stringify(result.parameters.fields, null, 2));
    
    return {
      intent: result.intent.displayName,
      parameters: result.parameters.fields
        ? Object.entries(result.parameters.fields).reduce(
            (acc, [key, value]) => {
              acc[key] = value.stringValue || value.numberValue;
              return acc;
            },
            {},
          )
        : {},
      fulfillmentText: result.fulfillmentText,
      confidence: result.intentDetectionConfidence,
    };
  } catch (error) {
    console.error("Error en detectIntentService:", error);
    throw error;
  }
};
