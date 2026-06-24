import express from "express";
import {
  createEspecialidad,
  getAllEspecialidades,
  getEspecialidadById,
} from "../controllers/especialidadesController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllEspecialidades);
router.post("/", authMiddleware, createEspecialidad);
router.get("/:id", authMiddleware, getEspecialidadById);

export default router;