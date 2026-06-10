import dialogflow from "@google-cloud/dialogflow";
import config from "../config/env.js";

const projectId = config.dialogflow.projectId;
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: config.dialogflow.credentialsPath,
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
