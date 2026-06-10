import {
  getAllPacientesService,
  getPacienteByIdService,
  getPacienteByDniService,
} from "../services/pacientesService.js";

export const getAllPacientes = async (req, res) => {
  try {
    const pacientes = await getAllPacientesService();

    res.status(200).json({
      message: "Pacientes obtenidos",
      data: pacientes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPacienteById = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await getPacienteByIdService(id);

    res.status(200).json({
      message: "Paciente obtenido",
      data: paciente,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getPacienteByDni = async (req, res) => {
  try {
    const { dni } = req.params;

    const paciente = await getPacienteByDniService(dni);

    res.status(200).json({
      message: "Paciente obtenido",
      data: paciente,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
