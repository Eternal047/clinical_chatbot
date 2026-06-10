import {
  getAllMedicosService,
  getMedicoByIdService,
} from "../services/medicosService.js";

export const getAllMedicos = async (req, res) => {
  try {
    const { especialidad } = req.query;

    const medicos = await getAllMedicosService(especialidad);

    res.status(200).json({
      message: "Médicos obtenidos",
      data: medicos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMedicoById = async (req, res) => {
  try {
    const { id } = req.params;

    const medico = await getMedicoByIdService(id);

    res.status(200).json({
      message: "Médico obtenido",
      data: medico,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
