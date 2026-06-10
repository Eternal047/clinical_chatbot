# Configuración de Chatbot con Dialogflow y Twilio

Este documento explica cómo configurar el chatbot de WhatsApp con Google Cloud Dialogflow y Twilio.

## Requisitos

1. Cuenta de Google Cloud con Dialogflow habilitado
2. Cuenta de Twilio con número WhatsApp Business
3. Archivo de credenciales JSON de Google Cloud

## Estructura del Chatbot

```
server/src/chatbot/
├── dialogflow.service.js      # Detecta intenciones con Dialogflow
├── twilio.service.js          # Formatea respuestas en TwiML
├── webhook.controller.js      # Maneja requests de WhatsApp
└── intents/
    ├── solicitar_cita.js           # Agendar cita
    ├── cancelar_cita.js            # Cancelar cita
    ├── reprogramar_cita.js         # Reprogramar cita
    ├── consultar_disponibilidad.js # Ver horarios libres
    ├── consultar_medicos.js        # Listar médicos
    ├── consultar_especialidades.js # Listar especialidades
    └── faq.js                      # Preguntas frecuentes
```

## Configuración de Google Cloud Dialogflow

### 1. Crear Proyecto en Google Cloud

```bash
# Login en Google Cloud
gcloud auth login

# Crear proyecto
gcloud projects create clinical-chatbot

# Setear proyecto
gcloud config set project clinical-chatbot
```

### 2. Habilitar Dialogflow API

```bash
gcloud services enable dialogflow.googleapis.com
```

### 3. Crear Clave de Servicio

```bash
# Crear cuenta de servicio
gcloud iam service-accounts create dialogflow-bot

# Crear clave JSON
gcloud iam service-accounts keys create google-credentials.json \
  --iam-account=dialogflow-bot@clinical-chatbot.iam.gserviceaccount.com

# Guardar en server/google-credentials.json
```

### 4. Asignar Permisos

```bash
gcloud projects add-iam-policy-binding clinical-chatbot \
  --member=serviceAccount:dialogflow-bot@clinical-chatbot.iam.gserviceaccount.com \
  --role=roles/dialogflow.admin
```

### 5. Crear Agente en Dialogflow Console

1. Ir a https://dialogflow.cloud.google.com/
2. Crear nuevo agente
3. Seleccionar idioma: Español
4. Crear intents para cada acción:

**Intent: solicitar_cita**

- Training phrases:
  - "quiero agendar una cita"
  - "necesito una cita"
  - "agendar cita de @especialidad"
- Parameters: nombre, especialidad, fecha, hora
- Fulfillment: Webhook enabled

**Intent: cancelar_cita**

- Training phrases:
  - "cancelar mi cita"
  - "quiero cancelar una cita"
  - "cancelar cita del @fecha"
- Parameters: dni
- Fulfillment: Webhook enabled

**Intent: reprogramar_cita**

- Training phrases:
  - "reprogramar mi cita"
  - "cambiar fecha de cita"
  - "mover mi cita"
- Parameters: dni, fecha, hora
- Fulfillment: Webhook enabled

**Intent: consultar_disponibilidad**

- Training phrases:
  - "horarios disponibles"
  - "¿hay disponibilidad?"
  - "ver horarios de @especialidad"
- Parameters: especialidad, fecha
- Fulfillment: Webhook enabled

**Intent: consultar_medicos**

- Training phrases:
  - "listar médicos"
  - "¿quién es el médico?"
  - "médicos de @especialidad"
- Parameters: especialidad
- Fulfillment: Webhook enabled

**Intent: consultar_especialidades**

- Training phrases:
  - "especialidades disponibles"
  - "¿qué especialidades hay?"
  - "listar especialidades"
- Parameters: ninguno
- Fulfillment: Webhook enabled

**Intent: faq**

- Training phrases:
  - "ayuda"
  - "necesito ayuda"
  - "¿cómo funciona?"
  - "información"
- Parameters: ninguno
- Fulfillment: Webhook enabled

## Configuración de Twilio

### 1. Crear Cuenta

1. Ir a https://www.twilio.com
2. Registrarse
3. Obtener número de teléfono

### 2. Habilitar WhatsApp Sandbox

1. Ir a Messaging → WhatsApp → Sandbox
2. Seguir las instrucciones de verificación
3. Guardar credenciales en `.env`

### 3. Configurar Webhook

1. Ir a Messaging → WhatsApp → Sandbox
2. Webhook URL para mensajes entrantes: `https://tu-dominio.com/chatbot/webhook`
3. Método: POST

## Variables de Entorno Necesarias

```env
# Dialogflow
DIALOGFLOW_PROJECT_ID=tu-project-id
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Twilio
TWILIO_ACCOUNT_SID=tu-account-sid
TWILIO_AUTH_TOKEN=tu-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Flow del Chatbot

```
Usuario envía mensaje → Twilio → /chatbot/webhook
                                    ↓
                          Detectar intención (Dialogflow)
                                    ↓
                          Ejecutar handler del intent
                                    ↓
                          Llamar servicios de negocio
                                    ↓
                          Formatear respuesta TwiML
                                    ↓
                          Enviar a Twilio → Usuario
```

## Handlers de Intents

### solicitar_cita.js

- Recibe: nombre, especialidad, fecha, hora
- Crea cita en la BD
- Retorna confirmación o error de disponibilidad

### cancelar_cita.js

- Recibe: dni
- Busca citas activas
- Cancela la cita
- Retorna confirmación

### reprogramar_cita.js

- Recibe: dni, fecha, hora
- Valida nuevo horario
- Actualiza cita
- Retorna confirmación

### consultar_disponibilidad.js

- Recibe: especialidad, fecha
- Lista horarios disponibles
- Retorna horarios con médicos

### consultar_medicos.js

- Recibe: especialidad (opcional)
- Lista médicos con especialidades
- Retorna información formateada

### consultar_especialidades.js

- Retorna todas las especialidades
- Muestra cantidad de médicos por especialidad

### faq.js

- Retorna información estática
- Horarios, ubicación, comandos disponibles

## Pruebas Locales

Para probar con ngrok:

```bash
# Terminal 1: Iniciar servidor
npm run dev

# Terminal 2: Exponer con ngrok
npx ngrok http 3000

# Configurar webhook en Twilio:
# https://tu-ngrok-url.ngrok.io/chatbot/webhook

# Enviar mensaje de prueba al número de Twilio
```

## Troubleshooting

### Error: "Credenciales no encontradas"

- Verificar que `google-credentials.json` está en `server/`
- Verificar variable `GOOGLE_APPLICATION_CREDENTIALS` en `.env`

### Dialogflow no detecta intención

- Revisar "Training phrases" en Dialogflow Console
- Aumentar cantidad de ejemplos
- Verificar que el intent tiene "Webhook enabled"

### TwiML inválido

- Revisar que el mensaje no tenga caracteres especiales sin escapar
- Validar XML con online validator

### Twilio no envía webhook

- Verificar token de autenticación
- Revisar logs de Twilio
- Configurar URL pública (usar ngrok en desarrollo)
