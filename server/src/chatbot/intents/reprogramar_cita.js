import {
  obtenerCitasActivasPorTelefono,
  reprogramarCita,
} from "../../api/services/citasService.js";
import { obtenerHorariosDisponibles } from "../../api/services/horariosService.js";

const limpiarContextos = (queryResult) =>
  (queryResult.outputContexts || []).map((contexto) => ({
    name: contexto.name,
    lifespanCount: 0,
  }));

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

const normalizarConfirmacion = (valor) => {
  const texto = Array.isArray(valor)
    ? valor[0]
    : typeof valor === "string"
      ? valor
      : valor?.value || valor?.stringValue || "";

  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const resumenCita = (cita) => {
  const horario = cita.horario;
  const fecha = new Date(cita.fecha).toLocaleDateString("es-PE");
  return `${fecha} - Dr/a. ${horario.medico.nombre} (${horario.medico.especialidad.nombre}) - ${horario.diaSemana} ${horario.horaInicio}-${horario.horaFin}`;
};

export const procesarReprogramarCita = async (queryResult) => {
  const intentName = queryResult.intent.displayName;
  const telefono = queryResult.telefonoUsuario;

  if (intentName === "reprogramar_cita") {
    const citas = await obtenerCitasActivasPorTelefono(telefono);
    if (!citas.length) {
      return {
        text: "No tienes citas activas para reprogramar. Necesitas algo mas?",
        contexts: limpiarContextos(queryResult),
      };
    }

    const opciones = citas.map((cita) => ({
      id: cita.id,
      horarioId: cita.horarioId,
      medicoId: cita.horario.medicoId,
      resumen: resumenCita(cita),
    }));
    const lista = opciones
      .map((cita, index) => `${index + 1}. ${cita.resumen}`)
      .join("\n");
    const baseSession = (queryResult.outputContexts?.[0]?.name || "").split("/contexts/")[0];

    return {
      text: `Tus citas activas:\n\n${lista}\n\nResponde con el numero de la cita que deseas reprogramar.`,
      contexts: [
        ...limpiarContextos(queryResult),
        {
          name: `${baseSession}/contexts/awaiting_reprogramacion_seleccion`,
          lifespanCount: 5,
          parameters: { citas: JSON.stringify(opciones), telefono },
        },
      ],
    };
  }

  if (intentName === "reprogramar_cita - seleccionar") {
    const contexto = obtenerContexto(queryResult, "awaiting_reprogramacion_seleccion");
    const citas = JSON.parse(contexto?.parameters?.citas || "[]");
    const numero = obtenerNumero(queryResult);

    if (!numero || numero < 1 || numero > citas.length) {
      return { text: "Numero invalido. Elige un numero de la lista.", contexts: queryResult.outputContexts || [] };
    }

    const cita = citas[numero - 1];
    const horarios = (await obtenerHorariosDisponibles(cita.medicoId)).filter(
      (horario) => horario.id !== cita.horarioId,
    );

    if (!horarios.length) {
      return {
        text: "No hay otros horarios disponibles para ese medico.",
        contexts: limpiarContextos(queryResult),
      };
    }

    const lista = horarios
      .map((horario, index) => `${index + 1}. ${horario.diaSemana} ${horario.horaInicio}-${horario.horaFin}`)
      .join("\n");
    const baseSession = contexto.name.split("/contexts/")[0];

    return {
      text: `Horarios disponibles para reprogramar:\n\n${lista}\n\nResponde con el numero del nuevo horario.`,
      contexts: [
        { name: contexto.name, lifespanCount: 0 },
        {
          name: `${baseSession}/contexts/awaiting_reprogramacion_horario`,
          lifespanCount: 5,
          parameters: { citaId: cita.id, horarios: JSON.stringify(horarios), telefono },
        },
      ],
    };
  }

  if (intentName === "reprogramar_cita - horario") {
    const contexto = obtenerContexto(queryResult, "awaiting_reprogramacion_horario");
    const horarios = JSON.parse(contexto?.parameters?.horarios || "[]");
    const numero = obtenerNumero(queryResult);

    if (!numero || numero < 1 || numero > horarios.length) {
      return { text: "Numero invalido. Elige un numero de la lista.", contexts: queryResult.outputContexts || [] };
    }

    const horario = horarios[numero - 1];
    const baseSession = contexto.name.split("/contexts/")[0];
    const resumen = `${horario.diaSemana} ${horario.horaInicio}-${horario.horaFin}`;

    return {
      text: `Has seleccionado el nuevo horario: ${resumen}\n\nConfirmas la reprogramacion? Responde Si o No.`,
      contexts: [
        { name: contexto.name, lifespanCount: 0 },
        {
          name: `${baseSession}/contexts/awaiting_reprogramacion_confirmacion`,
          lifespanCount: 3,
          parameters: {
            citaId: contexto.parameters.citaId,
            nuevoHorarioId: horario.id,
            resumen,
            telefono,
          },
        },
      ],
    };
  }

  if (intentName === "reprogramar_cita - confirmar") {
    const confirmacion = normalizarConfirmacion(queryResult.parameters?.confirmacion);
    const contexto = obtenerContexto(queryResult, "awaiting_reprogramacion_confirmacion");

    if (confirmacion !== "si") {
      return { text: "Reprogramacion cancelada. Necesitas algo mas?", contexts: limpiarContextos(queryResult) };
    }

    try {
      await reprogramarCita(contexto?.parameters?.citaId, contexto?.parameters?.nuevoHorarioId);
      return {
        text: `Cita reprogramada con exito. Nuevo horario: ${contexto?.parameters?.resumen}`,
        contexts: limpiarContextos(queryResult),
      };
    } catch (error) {
      console.error("Error al reprogramar cita:", error);
      return {
        text: "Ocurrio un error al reprogramar. Intenta de nuevo mas tarde.",
        contexts: limpiarContextos(queryResult),
      };
    }
  }

  return { text: "No pude procesar la reprogramacion.", contexts: limpiarContextos(queryResult) };
};