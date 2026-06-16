export const procesarProporcionarDatos = async (queryResult) => {
  // Extraer nombre: si es objeto { name: "..." }, tomar la propiedad name
  const nombreParam = queryResult.parameters.nombre_paciente;
  const nombre = (typeof nombreParam === 'object' && nombreParam.name) 
                  ? nombreParam.name 
                  : nombreParam;

  // DNI: asegurar que sea string
  const dni = String(queryResult.parameters.dni_paciente || '').trim();

  const contextParams = queryResult.outputContexts?.[0]?.parameters || {};

  if (!nombre || !dni) {
    return {
      text: 'Necesito ambos datos: nombre completo y DNI. Intenta nuevamente.',
      contexts: queryResult.outputContexts,
    };
  }

  // ... resto del código usando nombre y dni (strings)
  const {
    nombreMedico,
    dia,
    horaInicio,
    horaFin,
    especialidad,
    horarioId,
    medicoId,
    telefono,
  } = contextParams;

  const resumen = `📋 *Resumen de tu cita:*
- Especialidad: ${especialidad}
- Médico: Dr/a. ${nombreMedico}
- Horario: ${dia} de ${horaInicio} a ${horaFin}
- Paciente: ${nombre}
- DNI: ${dni}

¿Confirmas la cita? (responde *Sí* o *No*)`;

  const nuevoContextName = queryResult.outputContexts[0].name.replace(
    'awaiting_datos_paciente',
    'awaiting_confirmacion'
  );

  return {
    text: resumen,
    contexts: [{
      name: nuevoContextName,
      lifespanCount: 2,
      parameters: {
        horarioId,
        medicoId,
        nombreMedico,
        dia,
        horaInicio,
        horaFin,
        especialidad,
        nombre_paciente: nombre,   // string limpio
        dni_paciente: dni,        // string limpio
        telefono,
      },
    }],
  };
};