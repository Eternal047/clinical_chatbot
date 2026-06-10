import express from "express";
import {
  getAllMedicos,
  getMedicoById,
} from "../controllers/medicosController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/medicos?especialidad=X
router.get("/", authMiddleware, getAllMedicos);

// GET /api/medicos/:id
router.get("/:id", authMiddleware, getMedicoById);

export default router;
