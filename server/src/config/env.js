import dotenv from "dotenv";

dotenv.config();

// Variables requeridas
const requiredVars = [
  "DATABASE_URL",
  "GOOGLE_CREDENTIALS_JSON",
  "META_VERIFY_TOKEN",
  "META_APP_SECRET",
  "META_WHATSAPP_ACCESS_TOKEN",
  "META_WHATSAPP_PHONE_NUMBER_ID",
  "META_GRAPH_API_VERSION",
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
  metaWhatsApp: {
    verifyToken: process.env.META_VERIFY_TOKEN,
    appSecret: process.env.META_APP_SECRET,
    accessToken: process.env.META_WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID,
    graphApiVersion: process.env.META_GRAPH_API_VERSION,
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
