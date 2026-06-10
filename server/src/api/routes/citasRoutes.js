import express from "express";
import {
  createCita,
  getAllCitas,
  getCitaById,
  getCitasByDni,
  cancelarCita,
  reprogramarCita,
} from "../controllers/citasController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { rolesMiddleware } from "../middlewares/roles.middleware.js";

const router = express.Router();

// POST /api/citas
router.post("/", authMiddleware, createCita);

// GET /api/citas (solo ADMIN)
router.get("/", authMiddleware, rolesMiddleware(["ADMIN"]), getAllCitas);

// GET /api/citas/:id
router.get("/:id", authMiddleware, getCitaById);

// GET /api/citas/paciente/:dni
router.get("/paciente/:dni", authMiddleware, getCitasByDni);

// PATCH /api/citas/:id/cancelar
router.patch("/:id/cancelar", authMiddleware, cancelarCita);

// PATCH /api/citas/:id/reprogramar
router.patch("/:id/reprogramar", authMiddleware, reprogramarCita);

export default router;
