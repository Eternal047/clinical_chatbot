import express from "express";
import {
  getAllEspecialidades,
  getEspecialidadById,
} from "../controllers/especialidadesController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/especialidades
router.get("/", authMiddleware, getAllEspecialidades);

// GET /api/especialidades/:id
router.get("/:id", authMiddleware, getEspecialidadById);

export default router;
