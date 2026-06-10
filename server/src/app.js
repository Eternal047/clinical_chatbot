import express from "express";
import cors from "cors";

import authRoutes from "./api/routes/authRoutes.js";
import citasRoutes from "./api/routes/citasRoutes.js";
import horariosRoutes from "./api/routes/horariosRoutes.js";
import medicosRoutes from "./api/routes/medicosRoutes.js";
import pacientesRoutes from "./api/routes/pacientesRoutes.js";
import especialidadesRoutes from "./api/routes/especialidadesRoutes.js";
import { handleWebhook } from "./chatbot/webhook.controller.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/horarios", horariosRoutes);
app.use("/api/medicos", medicosRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/especialidades", especialidadesRoutes);

// Chatbot Routes
app.post("/chatbot/webhook", handleWebhook);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

export default app;
