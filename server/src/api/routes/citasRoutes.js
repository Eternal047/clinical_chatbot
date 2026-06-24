import express from "express";
import {
  cancelarCita,
  createCita,
  getAllCitas,
  getCitaById,
  getCitasByDni,
  reprogramarCitaController,
} from "../controllers/citasController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllCitas);
router.post("/", authMiddleware, createCita);
router.get("/paciente/:dni", authMiddleware, getCitasByDni);
router.get("/:id", authMiddleware, getCitaById);
router.patch("/:id/cancelar", authMiddleware, cancelarCita);
router.patch("/:id/reprogramar", authMiddleware, reprogramarCitaController);

console.log("✅ Citas routes loaded");

export default router;