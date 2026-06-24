import {
  createEspecialidadService,
  getAllEspecialidadesService,
  getEspecialidadByIdService,
} from "../services/especialidadesService.js";

export const getAllEspecialidades = async (req, res) => {
  try {
    const especialidades = await getAllEspecialidadesService();
    res.status(200).json({ message: "Especialidades obtenidas", data: especialidades });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEspecialidadById = async (req, res) => {
  try {
    const especialidad = await getEspecialidadByIdService(req.params.id);
    res.status(200).json({ message: "Especialidad obtenida", data: especialidad });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const createEspecialidad = async (req, res) => {
  try {
    const especialidad = await createEspecialidadService(req.body);
    res.status(201).json({ message: "Especialidad creada exitosamente", data: especialidad });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};