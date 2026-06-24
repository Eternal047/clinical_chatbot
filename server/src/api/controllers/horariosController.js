import {
  crearHorarioService,
  obtenerHorariosDisponibles,
  obtenerTodosHorarios,
} from "../services/horariosService.js";

export const getHorariosDisponibles = async (req, res) => {
  try {
    const horarios = await obtenerHorariosDisponibles(req.params.medicoId);
    res.status(200).json({ message: "Horarios disponibles obtenidos", data: horarios });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllHorarios = async (req, res) => {
  try {
    const horarios = await obtenerTodosHorarios();
    res.status(200).json({ message: "Horarios obtenidos", data: horarios });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createHorario = async (req, res) => {
  try {
    const horario = await crearHorarioService(req.body);
    res.status(201).json({ message: "Horario creado exitosamente", data: horario });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};