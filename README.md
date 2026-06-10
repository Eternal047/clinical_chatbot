# Sistema de Gestión de Citas Médicas con Chatbot de WhatsApp

Sistema completo para la gestión de citas médicas con integración de chatbot inteligente a través de WhatsApp.

## Estructura del Proyecto

```
project-root/
├── client/                 # Aplicación React (Frontend)
│   ├── src/
│   │   ├── pages/         # Páginas principales
│   │   ├── components/    # Componentes reutilizables
│   │   ├── services/      # Servicios API
│   │   └── context/       # Context API
│   ├── index.html
│   └── package.json
│
├── server/                 # Servidor Node.js (Backend)
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/    # Rutas de la API
│   │   │   ├── controllers/  # Controladores
│   │   │   ├── services/  # Lógica de negocio
│   │   │   └── middlewares/  # Middlewares
│   │   ├── chatbot/
│   │   │   └── intents/   # Intents del chatbot
│   │   └── config/        # Configuración
│   ├── prisma/            # Esquemas y migraciones DB
│   ├── .env               # Variables de entorno
│   └── package.json
│
├── .gitignore
└── README.md
```

## Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** (para la base de datos)
- Cuentas en servicios externos:
  - Google Cloud Dialogflow
  - Twilio
  - Supabase (opcional)

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd clinical_chatbot
```

### 2. Configurar el Servidor (Backend)

```bash
cd server

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

**Variables de entorno necesarias en `server/.env`:**

- `DATABASE_URL`: Conexión a PostgreSQL
- `SUPABASE_URL` y `SUPABASE_KEY`: Credenciales de Supabase
- `DIALOGFLOW_PROJECT_ID`: ID del proyecto de Google Dialogflow
- `GOOGLE_APPLICATION_CREDENTIALS`: Ruta al archivo de credenciales JSON
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`: Credenciales de Twilio
- `TWILIO_WHATSAPP_NUMBER`: Número de WhatsApp de Twilio
- `JWT_SECRET`: Clave secreta para JWT
- `PORT`: Puerto del servidor (por defecto 3000)

```bash
# Iniciar servidor en modo desarrollo
npm run dev

# O en modo producción
npm start
```

### 3. Configurar el Cliente (Frontend)

```bash
cd client

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

El cliente estará disponible en `http://localhost:5173`

## Scripts Disponibles

### Server

- `npm run dev` - Inicia el servidor en modo desarrollo con hot reload
- `npm start` - Inicia el servidor en producción
- `npm run prisma:migrate` - Ejecuta migraciones de base de datos
- `npm run prisma:generate` - Genera cliente de Prisma

### Client

- `npm run dev` - Inicia servidor Vite en desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Previsualiza build de producción
- `npm run lint` - Ejecuta linter

## Tecnologías Utilizadas

### Backend

- **Express.js** - Framework web
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **Google Cloud Dialogflow** - IA para chatbot
- **Twilio** - Integración WhatsApp
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

### Frontend

- **React 18** - Librería UI
- **Vite** - Build tool
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP

## API Endpoints

### Health Check

- `GET /api/health` - Verifica el estado del servidor

## Configuración de Servicios Externos

### Google Cloud Dialogflow

1. Crear proyecto en Google Cloud Console
2. Habilitar API de Dialogflow
3. Crear clave de servicio JSON
4. Guardar en `server/google-credentials.json`
5. Configurar `DIALOGFLOW_PROJECT_ID` en `.env`

### Twilio

1. Crear cuenta en Twilio
2. Obtener número de WhatsApp
3. Configurar webhooks para recibir mensajes
4. Agregar `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y `TWILIO_WHATSAPP_NUMBER` en `.env`

### PostgreSQL/Supabase

1. Crear base de datos PostgreSQL
2. Configurar `DATABASE_URL` en `.env`
3. Ejecutar `npm run prisma:migrate`

## Desarrollo

Para desarrollar las dos partes simultáneamente:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## Próximos Pasos

1. Definir esquema de base de datos en `server/prisma/schema.prisma`
2. Crear modelos Prisma (Usuarios, Citas, Médicos, etc.)
3. Implementar rutas API en `server/src/api/routes/`
4. Implementar controladores en `server/src/api/controllers/`
5. Crear intents del chatbot en `server/src/chatbot/intents/`
6. Crear páginas y componentes en `client/src/`
7. Implementar servicios de API en `client/src/services/`

## Licencia

MIT

## Soporte

Para reportar problemas o sugerencias, abrir un issue en el repositorio.
