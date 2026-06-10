import {
  createCitaService,
  getAllCitasService,
  getCitaByIdService,
  getCitasByDniService,
  cancelarCitaService,
  reprogramarCitaService,
} from "../services/citasService.js";

export const createCita = async (req, res) => {
  try {
    const { pacienteId, horarioId, fecha } = req.body;

    if (!pacienteId || !horarioId || !fecha) {
      return res
        .status(400)
        .json({ error: "pacienteId, horarioId y fecha son requeridos" });
    }

    const cita = await createCitaService(
      pacienteId,
      horarioId,
      new Date(fecha),
    );

    res.status(201).json({
      message: "Cita creada exitosamente",
      data: cita,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllCitas = async (req, res) => {
  try {
    const citas = await getAllCitasService();

    res.status(200).json({
      message: "Citas obtenidas",
      data: citas,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCitaById = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await getCitaByIdService(id);

    res.status(200).json({
      message: "Cita obtenida",
      data: cita,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getCitasByDni = async (req, res) => {
  try {
    const { dni } = req.params;

    const citas = await getCitasByDniService(dni);

    res.status(200).json({
      message: "Citas del paciente obtenidas",
      data: citas,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await cancelarCitaService(id);

    res.status(200).json({
      message: "Cita cancelada exitosamente",
      data: cita,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const reprogramarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { horarioId, fecha } = req.body;

    if (!horarioId || !fecha) {
      return res
        .status(400)
        .json({ error: "horarioId y fecha son requeridos" });
    }

    const cita = await reprogramarCitaService(id, horarioId, new Date(fecha));

    res.status(200).json({
      message: "Cita reprogramada exitosamente",
      data: cita,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
