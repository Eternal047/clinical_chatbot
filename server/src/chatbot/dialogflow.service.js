import dialogflow from "@google-cloud/dialogflow";

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
const projectId = credentials.project_id;

const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
});

export const detectIntentService = async (sessionId, text, languageCode = "es") => {
  // Limpiar sessionId de caracteres no permitidos
  const cleanSessionId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '');
  
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, cleanSessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: text.trim(),
        languageCode,
      },
    },
  };

  const [response] = await sessionClient.detectIntent(request);
  const result = response.queryResult;

  return {
    intent: result.intent?.displayName || 'Desconocido',
    parameters: result.parameters?.fields || {},
    allRequiredParamsPresent: result.allRequiredParamsPresent,
    fulfillmentText: result.fulfillmentText || '',
    outputContexts: result.outputContexts || [],
  };
};