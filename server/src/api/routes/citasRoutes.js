import express from "express";
import { createCita, getCitaById } from "../controllers/citasController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
// rolesMiddleware no se usa por ahora, pero se puede dejar importado si se prevé usar luego

const router = express.Router();

// POST /api/citas - Crear una cita (accesible para usuarios autenticados)
router.post("/", authMiddleware, createCita);

// GET /api/citas/:id - Obtener una cita por ID
router.get("/:id", authMiddleware, getCitaById);

// Las siguientes rutas quedan pendientes de implementación cuando los servicios estén listos:
// GET /api/citas (solo ADMIN) -> getAllCitas
// GET /api/citas/paciente/:dni -> getCitasByDni
// PATCH /api/citas/:id/cancelar -> cancelarCita
// PATCH /api/citas/:id/reprogramar -> reprogramarCita

export default router;