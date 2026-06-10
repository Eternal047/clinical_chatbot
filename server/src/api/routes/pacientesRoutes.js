import express from "express";
import {
  getAllPacientes,
  getPacienteById,
  getPacienteByDni,
} from "../controllers/pacientesController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/pacientes
router.get("/", authMiddleware, getAllPacientes);

// GET /api/pacientes/:id
router.get("/:id", authMiddleware, getPacienteById);

// GET /api/pacientes/dni/:dni
router.get("/dni/:dni", authMiddleware, getPacienteByDni);

export default router;
