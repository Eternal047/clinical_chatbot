# Configuracion de Dialogflow ES para el webhook de citas

Este webhook usa Dialogflow ES solo para NLP y slot filling. El backend no recolecta datos paso a paso: recibe parametros ya procesados en `req.body.queryResult.parameters`, consulta la BD mediante services y guarda el estado por `req.body.session`.

Endpoint del webhook:

```text
POST https://TU_DOMINIO/chatbot/webhook
```

En local con ngrok:

```text
POST https://TU_SUBDOMINIO.ngrok-free.app/chatbot/webhook
```

## Fulfillment global

En Dialogflow ES:

1. Ir a **Fulfillment**.
2. Activar **Webhook**.
3. En **URL**, colocar `/chatbot/webhook` con dominio publico HTTPS.
4. Guardar.
5. En cada intent que use backend, activar **Enable webhook call for this intent**.

## Entidades recomendadas

### `@especialidad`

Debe devolver el nombre de la especialidad tal como existe en la BD, por ejemplo:

- Cardiologia
- Dermatologia
- Neurologia
- Pediatria
- Oftalmologia
- Odontologia

Usa sinonimos si quieres aceptar textos sin tilde o variaciones:

- Cardiologia: cardiologia, cardio, cardiologo
- Pediatria: pediatria, pediatra, ninos

El valor resuelto debe coincidir con `Especialidad.nombre` en la BD.

### `@sys.number`

Usado por `seleccionar_medico` si decides mapear el numero como parametro. No es obligatorio porque el webhook tambien lee el numero desde `queryText`.

### `@sys.any` o expresiones personalizadas para DNI

Para `capturar_datos_usuario`, crea un parametro `dni`. Puedes usar:

- `@sys.any`, si aceptas DNI como texto libre.
- Una entidad personalizada `@dni` con expresiones numericas, si prefieres restringir.

Lo importante es que Dialogflow entregue el parametro con nombre exacto `dni`.

### `@sys.person` o `@sys.any` para nombre

Para `capturar_datos_usuario`, crea un parametro `nombre`. Puedes usar:

- `@sys.person`, si el agente lo reconoce bien.
- `@sys.any`, si quieres capturar nombres libres.

Lo importante es que Dialogflow entregue el parametro con nombre exacto `nombre`.

## Intent 1: `solicitar_cita`

Objetivo: iniciar la solicitud de cita y obtener la especialidad por slot filling.

### Training phrases

Ejemplos:

```text
Quiero sacar una cita
Necesito una cita medica
Deseo agendar una consulta
Quiero una cita en Cardiologia
Necesito atenderme en Pediatria
Busco cita para Dermatologia
```

Marca la especialidad como parametro `especialidad` cuando aparezca en la frase.

### Parameters and Action

Configura este parametro:

| Parameter name | Entity | Value | Required | Prompts |
| --- | --- | --- | --- | --- |
| `especialidad` | `@especialidad` | `$especialidad` | Si | `Que especialidad necesitas?` |

Aunque el webhook tambien responde si no llega especialidad, lo correcto es marcarlo como **Required** para que Dialogflow ES maneje el slot filling.

### Fulfillment

Activar:

```text
Enable webhook call for this intent
```

### Respuesta esperada del webhook

Si ya tiene especialidad, devuelve una lista numerada con medicos reales, dias y horarios guardados en BD, por ejemplo:

```text
Estos son los medicos disponibles para Cardiologia:
1. Dr. Juan Perez - lunes de 09:00 a 12:00; miercoles de 09:00 a 12:00

Responde con el numero del medico que prefieres.
```

El webhook guarda en sesion:

- `especialidad`
- `medicos` con horarios completos
- `estado = WAIT_DOCTOR_SELECTION`

## Intent 2: `seleccionar_medico`

Objetivo: recibir el numero elegido por el usuario y mapearlo al medico guardado en sesion.

### Training phrases

Ejemplos:

```text
1
2
3
El 1
El numero 2
Quiero el 3
Prefiero la opcion 1
```

### Parameters

No necesita slot filling. Opcionalmente puedes configurar:

| Parameter name | Entity | Value | Required |
| --- | --- | --- | --- |
| `numero` | `@sys.number` | `$numero` | No |

El webhook puede leer el numero desde `queryText`, asi que este parametro no es obligatorio.

### Fulfillment

Activar:

```text
Enable webhook call for this intent
```

### Respuesta esperada del webhook

```text
Perfecto, avanzamos con Dr. Juan Perez. Ahora enviame tu DNI y nombre para registrar la cita.
```

El webhook guarda en sesion:

- `medicoSeleccionado`
- `estado = WAIT_USER_DATA`

## Intent 3: `capturar_datos_usuario`

Objetivo: recibir DNI y nombre ya completados por Dialogflow ES y crear la cita en BD.

El webhook no debe conversar para recolectar estos datos. Dialogflow debe completar los slots antes de llamar al webhook.

### Training phrases

Ejemplos:

```text
Mi DNI es 73007495 y mi nombre es Kelly Bellido
73007495 Kelly Bellido
Soy Kelly Bellido con DNI 73007495
DNI 73007495, nombre Kelly Bellido
```

Marca el DNI como `dni` y el nombre como `nombre`.

### Parameters and Action

Configura estos parametros:

| Parameter name | Entity | Value | Required | Prompts |
| --- | --- | --- | --- | --- |
| `dni` | `@sys.any` o `@dni` | `$dni` | Si | `Indica tu DNI.` |
| `nombre` | `@sys.person` o `@sys.any` | `$nombre` | Si | `Indica tu nombre completo.` |

Ambos deben estar como **Required** para que Dialogflow haga el slot filling.

### Fulfillment

Activar:

```text
Enable webhook call for this intent
```

### Respuesta esperada del webhook

El webhook llama a `createCitaService()` y responde una confirmacion final con variacion de frases, por ejemplo:

```text
Listo, tu cita quedo confirmada. Kelly Bellido, te atendera Dr. Juan Perez el lunes 22/06/2026, de 09:00 a 12:00.
```

Luego limpia la sesion.

## Contextos recomendados

Para evitar que `seleccionar_medico` o `capturar_datos_usuario` se disparen fuera de orden, configura contexts en Dialogflow ES.

### `solicitar_cita`

Output context:

```text
awaiting_doctor_selection
Lifespan: 3
```

### `seleccionar_medico`

Input context:

```text
awaiting_doctor_selection
```

Output context:

```text
awaiting_user_data
Lifespan: 3
```

### `capturar_datos_usuario`

Input context:

```text
awaiting_user_data
```

No necesita output context.

Nota: el estado real del flujo tambien se guarda en backend por `req.body.session`. Los contexts ayudan a Dialogflow a clasificar correctamente cada mensaje.

## Payload que espera el webhook

Dialogflow ES envia algo parecido a esto:

```json
{
  "session": "projects/PROJECT_ID/agent/sessions/SESSION_ID",
  "queryResult": {
    "queryText": "Quiero una cita en Cardiologia",
    "intent": {
      "displayName": "solicitar_cita"
    },
    "parameters": {
      "especialidad": "Cardiologia"
    }
  }
}
```

Para seleccionar medico:

```json
{
  "session": "projects/PROJECT_ID/agent/sessions/SESSION_ID",
  "queryResult": {
    "queryText": "1",
    "intent": {
      "displayName": "seleccionar_medico"
    },
    "parameters": {}
  }
}
```

Para capturar datos:

```json
{
  "session": "projects/PROJECT_ID/agent/sessions/SESSION_ID",
  "queryResult": {
    "queryText": "Mi DNI es 73007495 y mi nombre es Kelly Bellido",
    "intent": {
      "displayName": "capturar_datos_usuario"
    },
    "parameters": {
      "dni": "73007495",
      "nombre": "Kelly Bellido"
    }
  }
}
```

## Integracion con Twilio

No elimines Twilio. El mismo endpoint `/chatbot/webhook` tambien acepta el webhook de Twilio con `Body` y `From`.

Flujo:

```text
WhatsApp -> Twilio -> /chatbot/webhook -> detectIntentService() -> Dialogflow ES -> services/BD -> TwiML
```

Para Twilio, configura el webhook de mensajes entrantes hacia:

```text
https://TU_DOMINIO/chatbot/webhook
```

Metodo:

```text
POST
```

Content type habitual:

```text
application/x-www-form-urlencoded
```

El controller distingue automaticamente:

- Si llega `queryResult`, responde JSON para Dialogflow ES.
- Si llega `Body` y `From`, responde XML/TwiML para Twilio.

## Checklist rapido

- Los intents se llaman exactamente `solicitar_cita`, `seleccionar_medico`, `capturar_datos_usuario`.
- `solicitar_cita` tiene parametro requerido `especialidad`.
- `capturar_datos_usuario` tiene parametros requeridos `dni` y `nombre`.
- Los tres intents tienen webhook activado.
- Las especialidades de Dialogflow coinciden con los nombres en BD.
- Twilio apunta al mismo endpoint `/chatbot/webhook` si usas WhatsApp.
- El backend tiene `DATABASE_URL` configurado y migraciones aplicadas.
