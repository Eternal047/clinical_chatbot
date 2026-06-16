import { obtenerHorariosDisponibles } from "../services/horariosService.js";

/**
 * GET /api/horarios/:medicoId
 * Obtiene los horarios disponibles de un médico (con cupos > 0).
 */
export const getHorariosDisponibles = async (req, res) => {
  try {
    const { medicoId } = req.params;

    if (!medicoId) {
      return res.status(400).json({ error: "El ID del médico es requerido" });
    }

    const horarios = await obtenerHorariosDisponibles(medicoId);

    res.status(200).json({
      message: "Horarios disponibles obtenidos",
      data: horarios,
    });
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    res.status(500).json({ error: error.message });
  }
};