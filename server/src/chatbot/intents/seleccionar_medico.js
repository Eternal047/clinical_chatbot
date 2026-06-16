export const procesarSeleccionarMedico = async (queryResult) => {
  const numero = queryResult.parameters.numero_seleccionado; // entidad @sys.number-integer
  const contextParams = queryResult.outputContexts?.[0]?.parameters || {};
  const opciones = JSON.parse(contextParams.opciones || '[]');
  const especialidad = contextParams.especialidad;
  const telefono = contextParams.telefono;

  if (numero < 1 || numero > opciones.length) {
    return {
      text: 'Número inválido. Por favor, elige uno de la lista.',
      contexts: queryResult.outputContexts, // mantener contexto para reintento
    };
  }

  const seleccion = opciones[numero - 1];

  // Construir nuevo contexto para pedir datos del paciente
  const nuevoContextName = queryResult.outputContexts[0].name.replace(
    'awaiting_medico_selection',
    'awaiting_datos_paciente'
  );

  return {
    text: `Has seleccionado:\n` +
          `Dr/a. ${seleccion.nombreMedico}\n` +
          `${seleccion.dia} de ${seleccion.horaInicio} a ${seleccion.horaFin}\n\n` +
          `Ahora necesito tu *nombre completo* y *DNI*.`,
    contexts: [{
      name: nuevoContextName,
      lifespanCount: 3,
      parameters: {
        horarioId: seleccion.horarioId,
        medicoId: seleccion.medicoId,
        nombreMedico: seleccion.nombreMedico,
        dia: seleccion.dia,
        horaInicio: seleccion.horaInicio,
        horaFin: seleccion.horaFin,
        especialidad,
        telefono,
      },
    }],
  };
};