const obtenerContexto = (queryResult, nombre) => {
  return (queryResult.outputContexts || []).find((contexto) =>
    contexto.name.endsWith(`/contexts/${nombre}`),
  );
};

const obtenerNumero = (queryResult) => {
  const numero = queryResult.parameters?.numero_seleccionado;
  if (typeof numero === "number") return numero;
  const match = String(numero || queryResult.queryText || "").match(/\d+/);
  return match ? Number(match[0]) : Number.NaN;
};

export const procesarSeleccionarMedico = async (queryResult) => {
  const contextoSeleccion = obtenerContexto(queryResult, "awaiting_medico_selection");
  const contextParams = contextoSeleccion?.parameters || {};
  const opciones = JSON.parse(contextParams.opciones || "[]");
  const numero = obtenerNumero(queryResult);

  if (!opciones.length) {
    return {
      text: "No tengo horarios cargados para esta sesion. Inicia la solicitud nuevamente.",
      contexts: [],
    };
  }

  if (!numero || numero < 1 || numero > opciones.length) {
    return {
      text: "Numero invalido. Por favor, elige uno de la lista.",
      contexts: queryResult.outputContexts || [],
    };
  }

  const seleccion = opciones[numero - 1];
  const baseSession = contextoSeleccion.name.split("/contexts/")[0];

  return {
    text:
      `Has seleccionado:\n` +
      `Dr/a. ${seleccion.nombreMedico}\n` +
      `${seleccion.dia} de ${seleccion.horaInicio} a ${seleccion.horaFin}\n\n` +
      "Ahora necesito tu nombre completo y DNI.",
    contexts: [
      { name: contextoSeleccion.name, lifespanCount: 0 },
      {
        name: `${baseSession}/contexts/awaiting_datos_paciente`,
        lifespanCount: 3,
        parameters: {
          horarioId: seleccion.horarioId,
          medicoId: seleccion.medicoId,
          nombreMedico: seleccion.nombreMedico,
          dia: seleccion.dia,
          horaInicio: seleccion.horaInicio,
          horaFin: seleccion.horaFin,
          especialidad: contextParams.especialidad,
          telefono: contextParams.telefono,
        },
      },
    ],
  };
};