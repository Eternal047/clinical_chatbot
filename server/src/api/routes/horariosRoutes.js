import express from "express";
import { getHorariosDisponibles } from "../controllers/horariosController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/horarios/medico/:medicoId
// Devuelve los horarios con cupos disponibles del médico indicado
router.get("/medico/:medicoId", authMiddleware, getHorariosDisponibles);

// Las siguientes rutas requieren funciones que aún no existen en el controlador
// Se dejan comentadas hasta que se implementen:
//
// POST /api/horarios (solo ADMIN) → createHorario
// router.post("/", authMiddleware, rolesMiddleware(["ADMIN"]), createHorario);
//
// PATCH /api/horarios/:id (solo ADMIN) → updateHorario
// router.patch("/:id", authMiddleware, rolesMiddleware(["ADMIN"]), updateHorario);

export default router;
