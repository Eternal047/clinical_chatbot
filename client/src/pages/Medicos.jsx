import { useEffect, useState } from "react";
import api from "../services/api.js";

const diasSemana = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

const obtenerEspecialidadesDesdeMedicos = (medicos) => {
  const especialidades = new Map();

  medicos.forEach((medico) => {
    if (medico.especialidad?.id) {
      especialidades.set(medico.especialidad.id, medico.especialidad);
    }
  });

  return Array.from(especialidades.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre),
  );
};

const Medicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMedicoForm, setShowMedicoForm] = useState(false);
  const [showHorarioForm, setShowHorarioForm] = useState(false);
  const [medicoForm, setMedicoForm] = useState({ nombre: "", email: "", especialidadId: "" });
  const [horarioForm, setHorarioForm] = useState({ medicoId: "", diaSemana: "", horaInicio: "", horaFin: "", cupos: "" });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const medicosResponse = await api.get("/api/medicos");
      const medicosData = medicosResponse.data.data || [];
      setMedicos(medicosData);
      setEspecialidades(obtenerEspecialidadesDesdeMedicos(medicosData));
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar medicos");
    } finally {
      setLoading(false);
    }
  };

  const handleMedicoSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/api/medicos", medicoForm);
      setMedicoForm({ nombre: "", email: "", especialidadId: "" });
      setShowMedicoForm(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || "Error al crear medico");
    }
  };

  const handleHorarioSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/api/horarios", { ...horarioForm, cupos: Number(horarioForm.cupos) });
      setHorarioForm({ medicoId: "", diaSemana: "", horaInicio: "", horaFin: "", cupos: "" });
      setShowHorarioForm(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || "Error al crear horario");
    }
  };

  if (loading) {
    return <div className="loading-state">Cargando médicos…</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Médicos</h1>
          <p className="page-subtitle">Registra médicos, su especialidad y los horarios que atienden.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setShowMedicoForm((prev) => !prev)} className="btn btn-primary">
            {showMedicoForm ? "Cerrar" : "+ Nuevo médico"}
          </button>
          <button onClick={() => setShowHorarioForm((prev) => !prev)} className="btn btn-secondary">
            {showHorarioForm ? "Cerrar" : "+ Asignar horario"}
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {showMedicoForm && (
        <form onSubmit={handleMedicoSubmit} className="form-panel">
          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">Nombre</label>
              <input
                className="input"
                placeholder="Ej. Dr. Carlos Ramírez"
                value={medicoForm.nombre}
                onChange={(event) => setMedicoForm((prev) => ({ ...prev, nombre: event.target.value }))}
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="correo@clinica.com"
                value={medicoForm.email}
                onChange={(event) => setMedicoForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label">Especialidad</label>
              <select
                className="input"
                value={medicoForm.especialidadId}
                onChange={(event) => setMedicoForm((prev) => ({ ...prev, especialidadId: event.target.value }))}
                required
              >
                <option value="">Seleccionar especialidad</option>
                {especialidades.length === 0 && (
                  <option value="" disabled>No hay especialidades disponibles desde médicos</option>
                )}
                {especialidades.map((especialidad) => (
                  <option key={especialidad.id} value={especialidad.id}>{especialidad.nombre}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-block">Guardar médico</button>
          </div>
        </form>
      )}

      {showHorarioForm && (
        <form onSubmit={handleHorarioSubmit} className="form-panel">
          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">Médico</label>
              <select
                className="input"
                value={horarioForm.medicoId}
                onChange={(event) => setHorarioForm((prev) => ({ ...prev, medicoId: event.target.value }))}
                required
              >
                <option value="">Seleccionar médico</option>
                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>{medico.nombre}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Día de la semana</label>
              <select
                className="input"
                value={horarioForm.diaSemana}
                onChange={(event) => setHorarioForm((prev) => ({ ...prev, diaSemana: event.target.value }))}
                required
              >
                <option value="">Seleccionar día</option>
                {diasSemana.map((dia) => <option key={dia} value={dia}>{dia}</option>)}
              </select>
            </div>
            <div className="form-grid-2col">
              <div className="field-group">
                <label className="field-label">Hora inicio</label>
                <input
                  className="input"
                  type="time"
                  value={horarioForm.horaInicio}
                  onChange={(event) => setHorarioForm((prev) => ({ ...prev, horaInicio: event.target.value }))}
                  required
                />
              </div>
              <div className="field-group">
                <label className="field-label">Hora fin</label>
                <input
                  className="input"
                  type="time"
                  value={horarioForm.horaFin}
                  onChange={(event) => setHorarioForm((prev) => ({ ...prev, horaFin: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Cupos</label>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="Ej. 10"
                value={horarioForm.cupos}
                onChange={(event) => setHorarioForm((prev) => ({ ...prev, cupos: event.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Guardar horario</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Especialidad</th>
                <th>Horarios</th>
              </tr>
            </thead>
            <tbody>
              {medicos.length === 0 ? (
                <tr><td colSpan="4" className="empty-state">No hay médicos registrados todavía.</td></tr>
              ) : (
                medicos.map((medico) => (
                  <tr key={medico.id}>
                    <td className="cell-strong">{medico.nombre}</td>
                    <td className="cell-muted">{medico.email}</td>
                    <td>
                      {medico.especialidad?.nombre ? (
                        <span className="badge badge-neutral">
                          <span className="badge-dot" />
                          {medico.especialidad.nombre}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      {medico.horarios?.length ? (
                        medico.horarios.map((horario) => (
                          <div key={horario.id} className="schedule-line">
                            {horario.diaSemana} {horario.horaInicio}-{horario.horaFin} ({horario.cupos} cupos)
                          </div>
                        ))
                      ) : (
                        <span className="cell-muted">Sin horarios</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Medicos;