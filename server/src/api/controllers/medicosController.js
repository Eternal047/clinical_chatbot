import { obtenerPorEspecialidad, obtenerPorId } from "../services/medicosService.js";

/**
 * GET /api/medicos?especialidad=cardiologia
 * Lista los médicos de una especialidad (incluye horarios).
 */
export const getMedicosPorEspecialidad = async (req, res) => {
  try {
    const { especialidad } = req.query;

    if (!especialidad) {
      return res.status(400).json({ error: "El parámetro 'especialidad' es requerido" });
    }

    const medicos = await obtenerPorEspecialidad(especialidad);

    res.status(200).json({
      message: "Médicos obtenidos",
      data: medicos,
    });
  } catch (error) {
    console.error("Error al obtener médicos por especialidad:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/medicos/:id
 * Obtiene un médico por su ID (incluye especialidad y horarios).
 */
export const getMedicoById = async (req, res) => {
  try {
    const { id } = req.params;
    const medico = await obtenerPorId(id);

    if (!medico) {
      return res.status(404).json({ error: "Médico no encontrado" });
    }

    res.status(200).json({
      message: "Médico obtenido",
      data: medico,
    });
  } catch (error) {
    console.error("Error al obtener médico por ID:", error);
    res.status(500).json({ error: error.message });
  }
};