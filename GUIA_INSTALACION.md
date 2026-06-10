# 🚀 GUÍA DE INSTALACIÓN Y EJECUCIÓN

Aquí está todo lo que necesitas para que el proyecto funcione completamente.

---

## 📋 REQUISITOS PREVIOS

Asegúrate de tener instalado:

- **Node.js** >= 18.0.0 ([Descargar](https://nodejs.org/))
- **npm** >= 9.0.0
- **PostgreSQL** 12+ ([Descargar](https://www.postgresql.org/download/))

Verifica las versiones:

```bash
node --version
npm --version
postgres --version
```

---

## 🗄️ PASO 1: Configurar Base de Datos PostgreSQL

### 1.1 Crear base de datos

```bash
# Abre psql (PostgreSQL command line)
psql -U postgres

# En psql, ejecuta:
CREATE DATABASE clinical_db;
\q
```

### 1.2 Configurar credenciales en `.env`

En `server/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/clinical_db"
```

Reemplaza `postgres` y `password` con tus credenciales reales.

---

## ⚙️ PASO 2: Configurar Backend

### 2.1 Instalar dependencias (ya hecho)

```bash
cd server
npm install
```

### 2.2 Completar variables de entorno

En `server/.env`, completa todos los campos:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/clinical_db"

# JWT
JWT_SECRET="tu-jwt-secreto-muy-seguro-12345"

# Dialogflow (Opcional por ahora)
DIALOGFLOW_PROJECT_ID="tu-project-id"
GOOGLE_APPLICATION_CREDENTIALS="./google-credentials.json"

# Twilio (Opcional por ahora)
TWILIO_ACCOUNT_SID="tu-account-sid"
TWILIO_AUTH_TOKEN="tu-auth-token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Supabase (Opcional)
SUPABASE_URL=""
SUPABASE_KEY=""

# Server
PORT=3000
NODE_ENV=development
```

### 2.3 Ejecutar migraciones de Prisma

```bash
# Desde la carpeta /server
npx prisma migrate dev --name init

# Esto crea las tablas en la BD
```

### 2.4 Seedear datos iniciales

```bash
# Desde la carpeta /server
npm run prisma:seed

# O manualmente:
# node prisma/seed.js
```

Este script crea:

- ✅ 6 Especialidades (Cardiología, Dermatología, etc.)
- ✅ 5 Médicos
- ✅ 17 Horarios de atención
- ✅ 5 Pacientes de prueba
- ✅ 1 Administrador (email: admin@clinic.com, password: admin123)

### 2.5 Iniciar servidor

```bash
npm run dev
```

El servidor estará en: **http://localhost:3000**

Deberías ver:

```
🚀 Server running on port 3000
📍 Environment: development
```

---

## 🎨 PASO 3: Configurar Frontend

### 3.1 Instalar dependencias

```bash
cd client
npm install
```

### 3.2 Iniciar cliente

```bash
npm run dev
```

El cliente estará en: **http://localhost:5173**

---

## 🧪 PASO 4: Probar el Sistema

### 4.1 Acceder al panel administrativo

1. Abre **http://localhost:5173**
2. Deberías ser redirigido a `/login`
3. Ingresa credenciales:
   - **Email:** `admin@clinic.com`
   - **Password:** `admin123`

### 4.2 Probar funcionalidades

**En la página de Citas:**

- [ ] Listar citas (tabla vacía inicialmente, debes crear citas primero)
- [ ] Crear nueva cita (JSON directamente o vía API)

**En la página de Usuarios:**

- [ ] Ver pacientes de prueba creados

**En la página de Horarios:**

- [ ] Ver horarios de médicos
- [ ] Crear nuevo horario

---

## 🔌 PASO 5: Probar API con cURL o Postman

### 5.1 Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinic.com",
    "password": "admin123"
  }'
```

Respuesta esperada:

```json
{
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGc...",
    "usuario": {
      "id": "...",
      "nombre": "Administrador Sistema",
      "email": "admin@clinic.com",
      "rol": "ADMIN"
    }
  }
}
```

### 5.2 Crear Cita

```bash
# Reemplaza TOKEN con el JWT del login
curl -X POST http://localhost:3000/api/citas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "pacienteId": "PACIENTE_ID",
    "horarioId": "HORARIO_ID",
    "fecha": "2024-06-20T09:00:00Z"
  }'
```

### 5.3 Listar Citas

```bash
curl -X GET http://localhost:3000/api/citas \
  -H "Authorization: Bearer TOKEN"
```

### 5.4 Ver Horarios Disponibles

```bash
curl -X GET "http://localhost:3000/api/horarios/disponibles?especialidad=Cardiologia&fecha=2024-06-20" \
  -H "Authorization: Bearer TOKEN"
```

---

## 🗂️ Estructura Final

```
clinical_chatbot/
├── server/                    # Backend Node.js
│   ├── src/
│   │   ├── api/              # Rutas, controllers, services
│   │   ├── chatbot/          # Dialogflow, Twilio, intents
│   │   ├── config/           # Env, Prisma
│   │   ├── app.js
│   │   └── index.js
│   ├── prisma/
│   │   ├── schema.prisma     # Modelos de BD
│   │   └── seed.js           # Datos iniciales
│   ├── .env                  # Variables de entorno
│   ├── package.json
│   └── ...
│
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Login, Citas, Usuarios, Horarios
│   │   ├── components/       # ProtectedRoute
│   │   ├── context/          # AuthContext
│   │   ├── services/         # api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## ⚠️ PROBLEMAS COMUNES

### Error: "Cannot connect to database"

```
Solución:
1. Verificar PostgreSQL está ejecutándose
2. Verificar DATABASE_URL en .env
3. Verificar usuario/contraseña
```

### Error: "Token inválido"

```
Solución:
1. Completar JWT_SECRET en .env
2. Usar token reciente (expira en 7 días)
3. Limpiar localStorage y hacer login nuevamente
```

### Error: "Seeding failed"

```
Solución:
1. Ejecutar migraciones primero: npx prisma migrate dev
2. Verificar BD existe
3. Revisar errores de Prisma
```

### Client no conecta con servidor

```
Solución:
1. Verificar servidor en puerto 3000: npm run dev (en /server)
2. Verificar baseURL en services/api.js es http://localhost:3000
3. Verificar CORS habilitado en app.js
```

---

## 📚 Comandos Útiles

```bash
# Backend
cd server
npm run dev                    # Iniciar en desarrollo
npm run start                  # Iniciar en producción
npm run prisma:migrate         # Ejecutar migraciones
npm run prisma:seed            # Cargar datos iniciales
npm run prisma:generate        # Generar cliente Prisma

# Frontend
cd client
npm run dev                    # Iniciar en desarrollo
npm run build                  # Compilar para producción
npm run preview               # Ver compilación

# Base de datos
psql -U postgres              # Conectar a PostgreSQL
\c clinical_db                # Conectarse a BD
SELECT * FROM pacientes;      # Ver pacientes
\q                            # Salir
```

---

## 🎯 Checklist de Ejecución

- [ ] PostgreSQL instalado y ejecutándose
- [ ] Base de datos `clinical_db` creada
- [ ] Variables de entorno en `server/.env` completas
- [ ] Migraciones ejecutadas: `npx prisma migrate dev`
- [ ] Datos iniciales cargados: `npm run prisma:seed`
- [ ] Servidor ejecutándose: `npm run dev` (en /server)
- [ ] Cliente ejecutándose: `npm run dev` (en /client)
- [ ] Puedo acceder a http://localhost:5173
- [ ] Puedo hacer login con admin@clinic.com / admin123
- [ ] Veo pacientes, citas y horarios en el panel

---

## 📞 Siguientes Pasos (Integraciones)

Para completar el chatbot de WhatsApp:

1. **Google Cloud Dialogflow**
   - [ ] Crear proyecto en Google Cloud
   - [ ] Crear agente en Dialogflow
   - [ ] Crear intents
   - [ ] Descargar credenciales JSON
   - [ ] Guardar en `server/google-credentials.json`

2. **Twilio**
   - [ ] Crear cuenta Twilio
   - [ ] Activar sandbox WhatsApp
   - [ ] Obtener credenciales
   - [ ] Configurar webhook a `tu-dominio/chatbot/webhook`

3. **Deployment**
   - [ ] Subir a Heroku, Vercel o similar
   - [ ] Configurar BD en la nube (Supabase, Railway)
   - [ ] Actualizar URLs en .env

---

¡Listo! El proyecto debería estar 100% funcional ahora. 🎉
