import express from "express";
import {
  createHorario,
  getAllHorarios,
  getHorariosDisponibles,
} from "../controllers/horariosController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllHorarios);
router.post("/", authMiddleware, createHorario);
router.get("/medico/:medicoId", authMiddleware, getHorariosDisponibles);
router.get("/disponibles", authMiddleware, getAllHorarios);

export default router;