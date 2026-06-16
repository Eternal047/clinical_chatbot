import { obtenerPorEspecialidad } from '../../api/services/medicosService.js';
import { obtenerHorariosDisponibles } from '../../api/services/horariosService.js';

export const procesarSolicitarCita = async (queryResult) => {
  const especialidad = queryResult.parameters.especialidad; // nombre de especialidad
  const telefono = queryResult.telefonoUsuario; // inyectado por el webhook

  // 1. Obtener médicos de la especialidad
  const medicos = await obtenerPorEspecialidad(especialidad);
  if (!medicos || medicos.length === 0) {
    return {
      text: `No hay médicos disponibles para ${especialidad}. Intenta con otra especialidad.`,
      contexts: [],
    };
  }

  // 2. Construir lista de horarios disponibles (cada uno con su médico)
  const opciones = [];
  for (const medico of medicos) {
    const horarios = await obtenerHorariosDisponibles(medico.id);
    for (const horario of horarios) {
      opciones.push({
        horarioId: horario.id,
        medicoId: medico.id,
        nombreMedico: medico.nombre,
        dia: horario.diaSemana,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
      });
    }
  }

  if (opciones.length === 0) {
    return {
      text: `Todos los horarios de ${especialidad} están ocupados. Intenta más tarde.`,
      contexts: [],
    };
  }

  // 3. Formatear lista numerada
  let respuesta = `📋 *Horarios disponibles en ${especialidad}:*\n\n`;
  opciones.forEach((op, i) => {
    respuesta += `${i + 1}. Dr/a. ${op.nombreMedico} - ${op.dia} ${op.horaInicio}-${op.horaFin}\n`;
  });
  respuesta += '\nResponde con el *número* del horario que prefieras.';

  // 4. Guardar opciones en contexto
  const baseSession = queryResult.outputContexts?.[0]?.name?.split('/contexts/')[0] || '';
  const contextName = `${baseSession}/contexts/awaiting_medico_selection`;

  return {
    text: respuesta,
    contexts: [{
      name: contextName,
      lifespanCount: 5,
      parameters: {
        especialidad,
        opciones: JSON.stringify(opciones),
        telefono,
      },
    }],
  };
};
