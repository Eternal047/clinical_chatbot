# Chatbot de WhatsApp con Dialogflow ES y Meta Cloud API

El chatbot usa WhatsApp Cloud API como canal de entrada y salida, y Dialogflow ES
para deteccion de intents y fulfillment. La logica de citas permanece en los
handlers de `intents/` y los servicios de `src/api/services/`.

## Rutas

- `GET /whatsapp`: verificacion del webhook por Meta. Responde `hub.challenge`
  cuando `hub.verify_token` coincide con `META_VERIFY_TOKEN`.
- `POST /whatsapp`: recibe eventos de Meta, valida `X-Hub-Signature-256`, procesa
  mensajes de texto y confirma el evento con HTTP 200.
- `POST /chatbot/webhook`: fulfillment de Dialogflow ES. No debe configurarse en
  Meta como callback de WhatsApp.

## Flujo

```text
Paciente -> WhatsApp Cloud API -> POST /whatsapp
         -> meta-whatsapp.service.js -> Dialogflow ES
         -> POST /chatbot/webhook -> intents -> servicios -> base de datos
         <- fulfillmentText <- Graph API /messages <- Paciente
```

Los mensajes Meta usan `from` sin el prefijo `+`. El adaptador crea una sesion
de Dialogflow con el formato `wa_<telefono>`; el fulfillment recupera ese valor
como `+<telefono>` para conservar el formato almacenado en las citas.

## Variables de entorno

```env
META_VERIFY_TOKEN=TU_TOKEN_DE_VERIFICACION_META
META_APP_SECRET=TU_APP_SECRET_META
META_WHATSAPP_ACCESS_TOKEN=TU_ACCESS_TOKEN_META
META_WHATSAPP_PHONE_NUMBER_ID=TU_PHONE_NUMBER_ID_META
META_GRAPH_API_VERSION=v25.0
```

Tambien se mantienen las variables actuales de la base de datos, JWT y
credenciales de Dialogflow. Esta migracion no cambia la configuracion existente
de Dialogflow.

## Configuracion en Meta

1. Cree una aplicacion de tipo Business con el producto WhatsApp.
2. Configure como Callback URL una URL HTTPS publica que termine en `/whatsapp`.
3. Use el mismo valor de `META_VERIFY_TOKEN` en Meta y en el servidor.
4. Suscriba el campo `messages` del webhook de WhatsApp Business Account.
5. Guarde el access token, app secret y phone number ID en las variables Meta.

La firma se valida con el cuerpo crudo del evento y `META_APP_SECRET`. No debe
deshabilitarse esa validacion al pasar a produccion.

## Alcance actual

El adaptador procesa mensajes de texto. Eventos de estado y mensajes de otros
tipos se confirman ante Meta pero no se envian a Dialogflow.
