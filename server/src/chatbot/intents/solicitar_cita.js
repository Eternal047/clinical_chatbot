import { getAllEspecialidadesService } from "../../api/services/especialidadesService.js";
import { obtenerPorEspecialidad } from "../../api/services/medicosService.js";
import { obtenerHorariosDisponibles } from "../../api/services/horariosService.js";

const contextoBase = (queryResult) => {
  const contexto = queryResult.outputContexts?.[0]?.name || "";
  return contexto.includes("/contexts/") ? contexto.split("/contexts/")[0] : "";
};

const limpiarContextos = (queryResult) =>
  (queryResult.outputContexts || []).map((contexto) => ({
    name: contexto.name,
    lifespanCount: 0,
  }));

export const construirOpcionesMedicas = async (especialidad) => {
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

  return opciones;
};

export const mostrarMedicos = async (especialidad, telefono, queryResult) => {
  const opciones = await construirOpcionesMedicas(especialidad);

  if (!opciones.length) {
    return {
      text: `No hay horarios disponibles para ${especialidad}.`,
      contexts: limpiarContextos(queryResult),
    };
  }

  const lista = opciones
    .map(
      (opcion, index) =>
        `${index + 1}. Dr/a. ${opcion.nombreMedico} - ${opcion.dia} ${opcion.horaInicio}-${opcion.horaFin}`,
    )
    .join("\n");

  return {
    text: `Horarios disponibles en ${especialidad}:\n\n${lista}\n\nResponde con el numero del horario que prefieres.`,
    contexts: [
      ...limpiarContextos(queryResult),
      {
        name: `${contextoBase(queryResult)}/contexts/awaiting_medico_selection`,
        lifespanCount: 5,
        parameters: {
          especialidad,
          opciones: JSON.stringify(opciones),
          telefono,
        },
      },
    ],
  };
};

export const procesarSolicitarCita = async (queryResult) => {
  const especialidad = queryResult.parameters?.especialidad;
  const telefono = queryResult.telefonoUsuario;

  if (especialidad) {
    return mostrarMedicos(especialidad, telefono, queryResult);
  }

  const especialidades = await getAllEspecialidadesService();
  if (!especialidades.length) {
    return {
      text: "No hay especialidades disponibles en este momento.",
      contexts: limpiarContextos(queryResult),
    };
  }

  const lista = especialidades.map((especialidad) => `- ${especialidad.nombre}`).join("\n");

  return {
    text: `Especialidades disponibles:\n${lista}\n\nQue especialidad necesitas?`,
    contexts: [
      ...limpiarContextos(queryResult),
      {
        name: `${contextoBase(queryResult)}/contexts/awaiting_especialidad_selection`,
        lifespanCount: 5,
        parameters: { telefono },
      },
    ],
  };
};