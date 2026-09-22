const contextoActivo = (queryResult) =>
  (queryResult?.outputContexts || []).find(
    (contexto) => contexto?.lifespanCount !== 0,
  );

export const limpiarContextos = (queryResult) =>
  (queryResult?.outputContexts || [])
    .filter((contexto) => contexto?.name)
    .map((contexto) => ({
      name: contexto.name,
      lifespanCount: 0,
    }));

export const obtenerContexto = (queryResult, nombre) =>
  (queryResult?.outputContexts || []).find((contexto) =>
    contexto?.name?.endsWith(`/contexts/${nombre}`),
  );

export const obtenerDatosPaciente = (queryResult) => {
  const contextos = queryResult?.outputContexts || [];
  const contextoIdentidad = contextos.find((item) =>
    item?.name?.endsWith("/contexts/paciente_identidad"),
  );
  const contexto =
    contextoIdentidad ||
    contextos.find(
      (item) =>
        item?.parameters?.nombre_paciente && item?.parameters?.dni_paciente,
    );

  return {
    nombre_paciente: contexto?.parameters?.nombre_paciente || "",
    dni_paciente: contexto?.parameters?.dni_paciente || "",
  };
};

export const crearContextoIdentidad = (queryResult, datosPaciente) => {
  const session = obtenerSesion(queryResult);
  if (
    !session ||
    !datosPaciente?.nombre_paciente ||
    !datosPaciente?.dni_paciente
  ) {
    return null;
  }

  return {
    name: `${session}/contexts/paciente_identidad`,
    lifespanCount: 10,
    parameters: datosPaciente,
  };
};

export const obtenerSesion = (queryResult) => {
  if (queryResult?.session) return queryResult.session;

  const nombreContexto = contextoActivo(queryResult)?.name || "";
  return nombreContexto.includes("/contexts/")
    ? nombreContexto.split("/contexts/")[0]
    : "";
};

export const crearContexto = (
  queryResult,
  nombre,
  lifespanCount,
  parameters = {},
) => {
  const session = obtenerSesion(queryResult);
  if (!session) return null;

  return {
    name: `${session}/contexts/${nombre}`,
    lifespanCount,
    parameters,
  };
};

export const fallbackContextual = (queryResult) => {
  const nombreContexto = contextoActivo(queryResult)?.name || "";

  if (nombreContexto.endsWith("/awaiting_especialidad_selection")) {
    return "Continua con la solicitud de cita. Indica la especialidad que necesitas o escribe 'empezar de nuevo'.";
  }
  if (nombreContexto.endsWith("/awaiting_medico_selection")) {
    return "Necesito que elijas uno de los horarios listados. Responde con su numero o escribe 'empezar de nuevo'.";
  }
  if (nombreContexto.endsWith("/awaiting_datos_paciente")) {
    return "Para continuar necesito tu nombre completo y DNI. Tambien puedes escribir 'empezar de nuevo'.";
  }
  if (nombreContexto.endsWith("/awaiting_confirmacion")) {
    return "Responde Si para confirmar la cita o No para volver a elegir un horario.";
  }
  if (nombreContexto.endsWith("/awaiting_cancelacion_seleccion")) {
    return "Responde con el numero de la cita que deseas cancelar.";
  }
  if (nombreContexto.endsWith("/awaiting_cancelacion_confirmacion")) {
    return "Responde Si para cancelar la cita o No para conservarla.";
  }
  if (nombreContexto.endsWith("/awaiting_reprogramacion_seleccion")) {
    return "Responde con el numero de la cita que deseas reprogramar.";
  }
  if (nombreContexto.endsWith("/awaiting_reprogramacion_horario")) {
    return "Responde con el numero del nuevo horario.";
  }
  if (nombreContexto.endsWith("/awaiting_reprogramacion_confirmacion")) {
    return "Responde Si para confirmar la reprogramacion o No para cancelarla.";
  }
  if (nombreContexto.endsWith("/awaiting_especialidad_info")) {
    return "Indica el nombre de la especialidad cuyos horarios quieres consultar.";
  }

  return "No entendi la solicitud. Puedes pedir una cita, cancelar o reprogramar una cita, consultar tus citas o escribir 'ayuda'.";
};
