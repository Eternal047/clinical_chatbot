import { crearCita } from '../../api/services/citasService.js';
import { obtenerPorEspecialidad } from '../../api/services/medicosService.js';
import { obtenerHorariosDisponibles } from '../../api/services/horariosService.js';

export const procesarConfirmarCita = async (queryResult) => {
  // Asegurar que confirmacion sea string (viene de entidad @confirmacion)
  const confirmacionParam = queryResult.parameters.confirmacion;
  const confirmacion = typeof confirmacionParam === 'string' 
                        ? confirmacionParam.toLowerCase() 
                        : (confirmacionParam?.value || '').toLowerCase();

  const contextParams = queryResult.outputContexts?.[0]?.parameters || {};

  if (confirmacion === 'no') {
    // Volver a mostrar opciones disponibles
    const especialidad = contextParams.especialidad;
    const telefono = contextParams.telefono;

    const medicos = await obtenerPorEspecialidad(especialidad);
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

    let respuesta = `De acuerdo. Volvamos a elegir.\n\n📋 *Horarios disponibles en ${especialidad}:*\n\n`;
    opciones.forEach((op, i) => {
      respuesta += `${i + 1}. Dr/a. ${op.nombreMedico} - ${op.dia} ${op.horaInicio}-${op.horaFin}\n`;
    });
    respuesta += '\nResponde con el *número* del horario.';

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
  }

  // Confirmación positiva
  // Extraer y limpiar valores del contexto
  const horarioId = contextParams.horarioId;
  const nombre_paciente = typeof contextParams.nombre_paciente === 'object' && contextParams.nombre_paciente.name
                          ? String(contextParams.nombre_paciente.name)
                          : String(contextParams.nombre_paciente || '').trim();
  const dni_paciente = String(contextParams.dni_paciente || '').trim();
  const telefono = contextParams.telefono;

  // Validación extra por si acaso
  if (!horarioId || !nombre_paciente || !dni_paciente || !telefono) {
    return {
      text: 'Faltan datos para confirmar la cita. Por favor, inicia de nuevo.',
      contexts: [],
    };
  }

  try {
    const cita = await crearCita({
      horarioId,
      pacienteNombre: nombre_paciente,
      pacienteDni: dni_paciente,
      pacienteTelef: telefono,
    });

    return {
      text: `✅ ¡Cita registrada con éxito!\nN° de referencia: ${cita.id}\nGracias por usar nuestro servicio.`,
      contexts: [], // cerrar todos los contextos
    };
  } catch (error) {
    console.error('Error al guardar cita:', error);
    return {
      text: 'Ocurrió un error al registrar la cita. Por favor inténtalo más tarde.',
      contexts: [],
    };
  }
};