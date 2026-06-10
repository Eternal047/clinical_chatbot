# ✅ CHECKLIST: LO QUE FALTA PARA QUE EL PROYECTO FUNCIONE

Este archivo lista exactamente qué falta para tener el proyecto 100% funcional.

---

## 🚨 CRÍTICO - Sin esto NO funciona

### ✋ Base de Datos PostgreSQL

```
Estado: ❌ NO HECHO
Tiempo: 30-45 minutos

Pasos:
1. Descargar PostgreSQL: https://www.postgresql.org/download/
2. Instalar (seleccionar puerto 5432)
3. Recordar contraseña de postgres
4. Abrir pgAdmin o psql
5. Crear base de datos: CREATE DATABASE clinical_db;
6. Actualizar DATABASE_URL en server/.env
```

**Línea de comando (Linux/Mac):**

```bash
createdb clinical_db
```

---

### ⚙️ Configurar Variables de Entorno

```
Estado: ⚠️ PARCIAL (JWT_SECRET falta)
Tiempo: 5 minutos

En server/.env, reemplazar:
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/clinical_db"
JWT_SECRET="tu-secreto-super-largo-y-aleatorio-12345"
```

Generar JWT_SECRET seguro:

```bash
# macOS/Linux
openssl rand -base64 32

# Copiar salida y pegar en JWT_SECRET
```

---

### 🗄️ Ejecutar Migraciones de Prisma

```
Estado: ❌ NO HECHO
Tiempo: 2-3 minutos

En carpeta /server:
npx prisma migrate dev --name init

Esto crea todas las tablas en PostgreSQL.
```

---

### 🌱 Cargar Datos Iniciales

```
Estado: ❌ NO HECHO
Tiempo: 1 minuto

En carpeta /server:
npm run prisma:seed

Esto crea:
- 6 especialidades
- 5 médicos
- 17 horarios
- 5 pacientes de prueba
- 1 admin (admin@clinic.com / admin123)
```

---

## 🔧 IMPORTANTE - Mejora significativa

### ✅ Backend Iniciado

```
Estado: ⏳ PENDIENTE
Tiempo: Automático

En carpeta /server:
npm run dev

Debe mostrar:
🚀 Server running on port 3000
📍 Environment: development
```

---

### ✅ Frontend Iniciado

```
Estado: ⏳ PENDIENTE
Tiempo: Automático

En carpeta /client:
npm run dev

Debe mostrar:
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## 🌐 OPCIONAL - Integraciones (para chatbot)

### 📱 Google Cloud Dialogflow

```
Estado: ❌ NO CONFIGURADO
Importancia: Solo si quieres chatbot de WhatsApp
Tiempo: 1-2 horas

Pasos:
1. Ir a https://cloud.google.com/
2. Crear proyecto "clinical-chatbot"
3. Habilitar Dialogflow API
4. Crear agente en https://dialogflow.cloud.google.com/
5. Crear intents:
   - solicitar_cita
   - cancelar_cita
   - reprogramar_cita
   - consultar_disponibilidad
   - consultar_medicos
   - consultar_especialidades
   - faq
6. Descargar credenciales JSON
7. Guardar en server/google-credentials.json
8. Actualizar DIALOGFLOW_PROJECT_ID en .env
```

### 📞 Twilio WhatsApp

```
Estado: ❌ NO CONFIGURADO
Importancia: Solo si quieres chatbot de WhatsApp
Tiempo: 30-45 minutos

Pasos:
1. Ir a https://www.twilio.com/
2. Registrarse
3. Ir a Messaging → WhatsApp → Sandbox
4. Obtener credenciales:
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_WHATSAPP_NUMBER
5. Actualizar en server/.env
6. Configurar webhook:
   URL: https://tu-dominio.com/chatbot/webhook (cuando tengas dominio)
```

---

## 📊 RESUMEN: ORDEN DE EJECUCIÓN

```
1. PostgreSQL instalado             ← HACE AHORA
2. Database creada                  ← HACE AHORA
3. Variables .env completas         ← HACE AHORA
4. npx prisma migrate dev           ← HACE AHORA
5. npm run prisma:seed              ← HACE AHORA
6. npm run dev (en /server)         ← MANTÉN EJECUTÁNDOSE
7. npm run dev (en /client)         ← MANTÉN EJECUTÁNDOSE
8. Probar: http://localhost:5173    ← VERIFICA ACCESO
9. Login: admin@clinic.com          ← PRUEBA FUNCIONALIDAD
10. Chatbot (Dialogflow+Twilio)    ← DESPUÉS, OPCIONAL
```

---

## 🧪 CÓMO VERIFICAR QUE TODO FUNCIONA

### 1️⃣ Database está OK

```bash
# En carpeta /server
npx prisma studio

# Deberías ver interfaz gráfica con tablas
# Si ves 6 tablas: pacientes, medicos, especialidades, etc. → ✅ OK
```

### 2️⃣ Backend responde

```bash
curl http://localhost:3000/health

# Respuesta esperada:
# {"status":"ok","message":"Server is running"}
```

### 3️⃣ Frontend carga

```
Abre http://localhost:5173
Deberías ver pantalla de login
```

### 4️⃣ Login funciona

```
Email: admin@clinic.com
Contraseña: admin123
Deberías ver el panel administrativo
```

### 5️⃣ Todas las páginas cargan

```
- /citas (tabla de citas)
- /usuarios (tabla de pacientes)
- /horarios (tabla de horarios con botón crear)
```

---

## 🆘 ERRORES COMUNES Y SOLUCIONES

### Error: "Cannot find module '@prisma/client'"

```
Solución:
1. npm install
2. npx prisma generate
```

### Error: "ECONNREFUSED - connect ECONNREFUSED 127.0.0.1:5432"

```
Solución: PostgreSQL no está ejecutándose
1. Iniciar PostgreSQL (en Services o terminal)
2. Windows: services.msc → buscar PostgreSQL
3. macOS: brew services start postgresql
4. Linux: sudo systemctl start postgresql
```

### Error: "duplicate key value violates unique constraint"

```
Solución: Intenta seedear dos veces
1. Eliminar datos: npx prisma db push --force-reset
2. Seedear de nuevo: npm run prisma:seed
```

### Error: "TypeError: Cannot read property 'data' of undefined"

```
Solución: Backend no responde
1. Verificar npm run dev está ejecutándose en /server
2. Verificar PORT=3000 en .env
3. Verificar no hay otro proceso en puerto 3000
```

### Error: "401 Unauthorized"

```
Solución: Token inválido
1. Limpiar localStorage: F12 → Application → Storage → localStorage → Borrar
2. Hacer login nuevamente
3. Verificar JWT_SECRET en .env
```

---

## ⏱️ TIEMPO ESTIMADO TOTAL

| Tarea               | Tiempo     |
| ------------------- | ---------- |
| Instalar PostgreSQL | 15 min     |
| Crear database      | 5 min      |
| Configurar .env     | 5 min      |
| Prisma migrate      | 3 min      |
| Seedeo datos        | 2 min      |
| Iniciar servidor    | 1 min      |
| Iniciar cliente     | 1 min      |
| **TOTAL MÍNIMO**    | **32 min** |

Con Dialogflow + Twilio (opcional): +2-3 horas

---

## 🎯 ESTADO ACTUAL DEL CÓDIGO

✅ = Completamente hecho y listo
⏳ = Hecho pero requiere ejecución
❌ = No hecho, requiere setup externo

| Parte               | Estado | Requiere                    |
| ------------------- | ------ | --------------------------- |
| Backend API         | ✅     | Nada (npm install ya hecho) |
| Frontend UI         | ✅     | Nada (npm install ya hecho) |
| Autenticación       | ✅     | Database + JWT_SECRET       |
| CRUD Citas          | ✅     | Database                    |
| CRUD Horarios       | ✅     | Database                    |
| CRUD Médicos        | ✅     | Database                    |
| CRUD Especialidades | ✅     | Database                    |
| Chatbot Intents     | ✅     | Dialogflow + Twilio         |
| Seeding Script      | ✅     | npm run prisma:seed         |
| Migraciones         | ⏳     | npx prisma migrate dev      |

---

## 📝 PRÓXIMOS PASOS (DESPUÉS DE ESTO)

1. Hacer login en panel admin
2. Crear citas manualmente vía formulario (crear endpoint)
3. Probar cancelación de citas
4. Probar creación de horarios
5. Conectar Dialogflow + Twilio
6. Hacer deploy a producción

---

**¿Necesitas ayuda? Revisa GUIA_INSTALACION.md**
