# Sistema de Gestion de Citas Medicas con Chatbot de WhatsApp

Sistema de gestion de citas medicas con panel React, backend Express, Prisma,
Dialogflow ES y WhatsApp Cloud API de Meta.

## Estructura

```text
client/                 Aplicacion React
server/src/api/         Rutas, controladores, servicios y middlewares
server/src/chatbot/     Integracion WhatsApp y Dialogflow; intents del chatbot
server/prisma/          Esquema y migraciones de PostgreSQL
```

La integracion de WhatsApp pertenece a la capa de integracion del chatbot. Los
servicios de negocio y el esquema Prisma no se modifican para cambiar proveedor.

## Requisitos

- Node.js 18 o superior
- PostgreSQL
- Proyecto de Dialogflow ES configurado
- Aplicacion Meta Business con WhatsApp Cloud API

## Configuracion del servidor

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Variables principales:

```env
DATABASE_URL=POSTGRESQL_URL
GOOGLE_CREDENTIALS_JSON=JSON_DE_CREDENCIALES_ACTUAL
META_VERIFY_TOKEN=TU_TOKEN_DE_VERIFICACION_META
META_APP_SECRET=TU_APP_SECRET_META
META_WHATSAPP_ACCESS_TOKEN=TU_ACCESS_TOKEN_META
META_WHATSAPP_PHONE_NUMBER_ID=TU_PHONE_NUMBER_ID_META
META_GRAPH_API_VERSION=v25.0
JWT_SECRET=TU_JWT_SECRET
```

La configuracion existente de credenciales e identificadores de Dialogflow se
conserva tal como esta en el proyecto.

## Webhooks

- `GET /whatsapp`: verificacion solicitada por Meta.
- `POST /whatsapp`: eventos entrantes de WhatsApp Cloud API.
- `POST /chatbot/webhook`: fulfillment de Dialogflow ES.

En Meta, configure la Callback URL HTTPS publica con la ruta `/whatsapp` y
suscriba el campo `messages`. El detalle de la integracion esta en
`server/src/chatbot/README.md`.

## Cliente

```bash
cd client
npm install
npm run dev
```

## Scripts del servidor

- `npm run dev`: inicia Express con nodemon.
- `npm start`: inicia Express en produccion.
- `npm run prisma:migrate`: ejecuta migraciones.
- `npm run prisma:generate`: genera Prisma Client.
