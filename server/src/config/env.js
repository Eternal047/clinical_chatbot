import dotenv from "dotenv";

dotenv.config();

// Variables requeridas
const requiredVars = [
  "DATABASE_URL",
  "GOOGLE_CREDENTIALS_JSON",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_WHATSAPP_NUMBER",
  "JWT_SECRET",
];

// Validar que todas las variables existan
const missingVars = requiredVars.filter((variable) => !process.env[variable]);

if (missingVars.length > 0) {
  throw new Error(
    `Error: Las siguientes variables de entorno son requeridas pero no están definidas:\n${missingVars.join(
      "\n",
    )}\n\nPor favor, configura estas variables en tu archivo .env`,
  );
}

// Exportar configuración
const config = {
  database: {
    url: process.env.DATABASE_URL,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
};

export default config;
