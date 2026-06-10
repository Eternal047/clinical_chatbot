import {
  getAllEspecialidadesService,
  getEspecialidadByIdService,
} from "../services/especialidadesService.js";

export const getAllEspecialidades = async (req, res) => {
  try {
    const especialidades = await getAllEspecialidadesService();

    res.status(200).json({
      message: "Especialidades obtenidas",
      data: especialidades,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEspecialidadById = async (req, res) => {
  try {
    const { id } = req.params;

    const especialidad = await getEspecialidadByIdService(id);

    res.status(200).json({
      message: "Especialidad obtenida",
      data: especialidad,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
