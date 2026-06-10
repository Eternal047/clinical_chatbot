import express from "express";
import {
  getHorariosDisponibles,
  createHorario,
  updateHorario,
} from "../controllers/horariosController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { rolesMiddleware } from "../middlewares/roles.middleware.js";

const router = express.Router();

// GET /api/horarios/disponibles?especialidad=X&fecha=Y
router.get("/disponibles", authMiddleware, getHorariosDisponibles);

// POST /api/horarios (solo ADMIN)
router.post("/", authMiddleware, rolesMiddleware(["ADMIN"]), createHorario);

// PATCH /api/horarios/:id (solo ADMIN)
router.patch("/:id", authMiddleware, rolesMiddleware(["ADMIN"]), updateHorario);

export default router;
