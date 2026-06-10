# Cliente Administrativo - Sistema de Gestión de Citas Médicas

## Estructura

```
client/src/
├── pages/                      # Páginas principales
│   ├── Login.jsx              # Página de login
│   ├── Citas.jsx              # Gestión de citas
│   ├── Usuarios.jsx           # Listado de pacientes
│   └── Horarios.jsx           # Gestión de horarios
├── components/
│   └── ProtectedRoute.jsx     # Componente para rutas protegidas
├── context/
│   └── AuthContext.jsx        # Contexto de autenticación
├── services/
│   └── api.js                 # Instancia de axios con interceptores
├── App.jsx                     # Componente raíz con rutas
├── App.css                     # Estilos principales
└── main.jsx                    # Punto de entrada
```

## Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Backend ejecutándose en http://localhost:3000

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El cliente estará disponible en http://localhost:5173

## Build para Producción

```bash
npm run build
```

## Características

### Autenticación

- Login con email y password
- JWT almacenado en localStorage
- Interceptores automáticos que agregan token a requests
- Redirección a login si recibe 401
- Logout que limpia sesión

### Páginas

#### Login

- Formulario simple de email y contraseña
- Mensajes de error
- Redirección a citas después de login exitoso

#### Citas

- Tabla con todas las citas
- Columnas: Paciente, Teléfono, Fecha, Hora, Médico, Estado
- Botón para cancelar citas activas
- Recarga automática después de acciones

#### Usuarios

- Tabla con pacientes que tienen citas
- Columnas: Nombre, DNI, Teléfono
- Extrae datos de las citas disponibles

#### Horarios

- Tabla con horarios de médicos
- Columnas: Médico, Día, Hora Inicio, Hora Fin, Cupos
- Formulario inline para crear nuevos horarios
- Validación de campos requeridos
- Carga automática de médicos disponibles

### Navegación

- Barra de navegación con enlaces a todas las páginas (excepto en login)
- Saludo con nombre del usuario
- Botón de logout
- Redirección a /citas después de login

## API Integrada

El cliente consume los siguientes endpoints:

```
POST   /api/auth/login              → Login
GET    /api/citas                   → Listar citas
PATCH  /api/citas/:id/cancelar      → Cancelar cita
GET    /api/horarios/disponibles    → Listar horarios
POST   /api/horarios                → Crear horario
GET    /api/medicos                 → Listar médicos
```

## Configuración

- **Base URL**: http://localhost:3000
- **JWT Storage**: localStorage con key `authToken`
- **User Storage**: localStorage con key `user`
- **Timeout**: 30s (por defecto de axios)

## Flujo de Autenticación

1. Usuario accede a /login
2. Ingresa email y contraseña
3. Client POST a /api/auth/login
4. Backend retorna token y datos de usuario
5. Client guarda token en localStorage
6. AuthContext actualiza estado
7. Usuario es redirigido a /citas

## Manejo de Errores

- 401: Redirección automática a login
- 400-500: Mensaje de error específico mostrado al usuario
- Errores de conexión: Mensaje genérico

## Notas

- Todos los estilos son básicos e inline (sin CSS externo)
- Usa componentes funcionales con hooks
- React Router v6
- Axios para llamadas HTTP
- Context API para estado global
