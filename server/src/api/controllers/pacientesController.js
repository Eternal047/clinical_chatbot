import {
  getAllPacientesService,
  getPacienteByDniService,
  getPacienteByIdService,
} from "../services/pacientesService.js";

export const getAllPacientes = async (req, res) => {
  try {
    const pacientes = await getAllPacientesService();
    res.status(200).json({ message: "Pacientes obtenidos desde citas", data: pacientes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPacienteById = async (req, res) => {
  try {
    const paciente = await getPacienteByIdService(req.params.id);
    res.status(200).json({ message: "Paciente obtenido", data: paciente });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getPacienteByDni = async (req, res) => {
  try {
    const paciente = await getPacienteByDniService(req.params.dni);
    res.status(200).json({ message: "Paciente obtenido", data: paciente });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};