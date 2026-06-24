import {
  cancelarCitaService,
  crearCita,
  obtenerCitasPorDni,
  obtenerPorId,
  obtenerTodasLasCitas,
  reprogramarCita,
} from "../services/citasService.js";

export const createCita = async (req, res) => {
  try {
    const cita = await crearCita(req.body);
    res.status(201).json({ message: "Cita creada exitosamente", data: cita });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllCitas = async (req, res) => {
  try {
    const citas = await obtenerTodasLasCitas();
    res.status(200).json({ message: "Citas obtenidas", data: citas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCitaById = async (req, res) => {
  try {
    const cita = await obtenerPorId(req.params.id);
    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    res.status(200).json({ message: "Cita obtenida", data: cita });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCitasByDni = async (req, res) => {
  try {
    const citas = await obtenerCitasPorDni(req.params.dni);
    res.status(200).json({ message: "Citas del paciente obtenidas", data: citas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelarCita = async (req, res) => {
  try {
    const cita = await cancelarCitaService(req.params.id);
    res.status(200).json({ message: "Cita cancelada exitosamente", data: cita });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const reprogramarCitaController = async (req, res) => {
  try {
    const { horarioId, fecha } = req.body;
    if (!horarioId) {
      return res.status(400).json({ error: "horarioId es requerido" });
    }

    const cita = await reprogramarCita(req.params.id, horarioId, fecha);
    res.status(200).json({ message: "Cita reprogramada exitosamente", data: cita });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};