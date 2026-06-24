import express from "express";
import {
  createMedico,
  getAllMedicos,
  getMedicoById,
} from "../controllers/medicosController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllMedicos);
router.post("/", authMiddleware, createMedico);
router.get("/:id", authMiddleware, getMedicoById);

export default router;