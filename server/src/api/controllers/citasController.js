import { crearCita, obtenerPorId } from "../services/citasService.js";

/**
 * POST /api/citas
 * Crea una nueva cita.
 * Body: { pacienteDni, pacienteNombre, pacienteTelef, horarioId, fecha? }
 */
export const createCita = async (req, res) => {
  try {
    const { pacienteDni, pacienteNombre, pacienteTelef, horarioId, fecha } = req.body;

    if (!pacienteDni || !pacienteNombre || !pacienteTelef || !horarioId) {
      return res.status(400).json({
        error: "pacienteDni, pacienteNombre, pacienteTelef y horarioId son requeridos",
      });
    }

    const cita = await crearCita({
      pacienteDni,
      pacienteNombre,
      pacienteTelef,
      horarioId,
      fecha: fecha ? new Date(fecha) : undefined,
    });

    res.status(201).json({
      message: "Cita creada exitosamente",
      data: cita,
    });
  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/citas/:id
 * Obtiene una cita por su ID.
 */
export const getCitaById = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await obtenerPorId(id);

    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    res.status(200).json({
      message: "Cita obtenida",
      data: cita,
    });
  } catch (error) {
    console.error("Error al obtener cita:", error);
    res.status(500).json({ error: error.message });
  }
};