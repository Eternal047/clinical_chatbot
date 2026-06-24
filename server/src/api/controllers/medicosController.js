import {
  crearMedico,
  obtenerPorEspecialidad,
  obtenerPorId,
  obtenerTodosMedicos,
} from "../services/medicosService.js";

export const getAllMedicos = async (req, res) => {
  try {
    const { especialidad } = req.query;
    const medicos = especialidad
      ? await obtenerPorEspecialidad(especialidad)
      : await obtenerTodosMedicos();

    res.status(200).json({ message: "Medicos obtenidos", data: medicos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMedicosPorEspecialidad = getAllMedicos;

export const getMedicoById = async (req, res) => {
  try {
    const medico = await obtenerPorId(req.params.id);
    if (!medico) {
      return res.status(404).json({ error: "Medico no encontrado" });
    }

    res.status(200).json({ message: "Medico obtenido", data: medico });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createMedico = async (req, res) => {
  try {
    const medico = await crearMedico(req.body);
    res
      .status(201)
      .json({ message: "Medico creado exitosamente", data: medico });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
