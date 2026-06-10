import {
  getHorariosDisponiblesService,
  createHorarioService,
  updateHorarioService,
} from "../services/horariosService.js";

export const getHorariosDisponibles = async (req, res) => {
  try {
    const { especialidad, fecha } = req.query;

    const horarios = await getHorariosDisponiblesService(especialidad, fecha);

    res.status(200).json({
      message: "Horarios disponibles obtenidos",
      data: horarios,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createHorario = async (req, res) => {
  try {
    const { medicoId, diaSemana, horaInicio, horaFin, cupos } = req.body;

    if (!medicoId || !diaSemana || !horaInicio || !horaFin || !cupos) {
      return res.status(400).json({
        error:
          "medicoId, diaSemana, horaInicio, horaFin y cupos son requeridos",
      });
    }

    const horario = await createHorarioService(
      medicoId,
      diaSemana,
      horaInicio,
      horaFin,
      cupos,
    );

    res.status(201).json({
      message: "Horario creado exitosamente",
      data: horario,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const horario = await updateHorarioService(id, data);

    res.status(200).json({
      message: "Horario actualizado exitosamente",
      data: horario,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
