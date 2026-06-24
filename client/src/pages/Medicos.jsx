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
const inputStyle = { width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" };
const thStyle = { border: "1px solid #ddd", padding: "10px", textAlign: "left" };
const tdStyle = { border: "1px solid #ddd", padding: "10px", verticalAlign: "top" };

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
    return <div style={{ padding: "20px" }}>Cargando medicos...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Medicos</h1>
      {error && <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>}

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setShowMedicoForm((prev) => !prev)} style={primaryButtonStyle}>
          {showMedicoForm ? "Cerrar Medico" : "Crear Medico"}
        </button>
        <button onClick={() => setShowHorarioForm((prev) => !prev)} style={secondaryButtonStyle}>
          {showHorarioForm ? "Cerrar Horario" : "Asignar Horario"}
        </button>
      </div>

      {showMedicoForm && (
        <form onSubmit={handleMedicoSubmit} style={formStyle}>
          <input
            placeholder="Nombre"
            value={medicoForm.nombre}
            onChange={(event) => setMedicoForm((prev) => ({ ...prev, nombre: event.target.value }))}
            required
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email"
            value={medicoForm.email}
            onChange={(event) => setMedicoForm((prev) => ({ ...prev, email: event.target.value }))}
            required
            style={inputStyle}
          />
          <select
            value={medicoForm.especialidadId}
            onChange={(event) => setMedicoForm((prev) => ({ ...prev, especialidadId: event.target.value }))}
            required
            style={inputStyle}
          >
            <option value="">Seleccionar especialidad</option>
            {especialidades.length === 0 && (
              <option value="" disabled>No hay especialidades disponibles desde medicos</option>
            )}
            {especialidades.map((especialidad) => (
              <option key={especialidad.id} value={especialidad.id}>{especialidad.nombre}</option>
            ))}
          </select>
          <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>Guardar Medico</button>
        </form>
      )}

      {showHorarioForm && (
        <form onSubmit={handleHorarioSubmit} style={formStyle}>
          <select
            value={horarioForm.medicoId}
            onChange={(event) => setHorarioForm((prev) => ({ ...prev, medicoId: event.target.value }))}
            required
            style={inputStyle}
          >
            <option value="">Seleccionar medico</option>
            {medicos.map((medico) => (
              <option key={medico.id} value={medico.id}>{medico.nombre}</option>
            ))}
          </select>
          <select
            value={horarioForm.diaSemana}
            onChange={(event) => setHorarioForm((prev) => ({ ...prev, diaSemana: event.target.value }))}
            required
            style={inputStyle}
          >
            <option value="">Seleccionar dia</option>
            {diasSemana.map((dia) => <option key={dia} value={dia}>{dia}</option>)}
          </select>
          <input type="time" value={horarioForm.horaInicio} onChange={(event) => setHorarioForm((prev) => ({ ...prev, horaInicio: event.target.value }))} required style={inputStyle} />
          <input type="time" value={horarioForm.horaFin} onChange={(event) => setHorarioForm((prev) => ({ ...prev, horaFin: event.target.value }))} required style={inputStyle} />
          <input type="number" min="1" placeholder="Cupos" value={horarioForm.cupos} onChange={(event) => setHorarioForm((prev) => ({ ...prev, cupos: event.target.value }))} required style={inputStyle} />
          <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>Guardar Horario</button>
        </form>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Especialidad</th>
            <th style={thStyle}>Horarios</th>
          </tr>
        </thead>
        <tbody>
          {medicos.length === 0 ? (
            <tr><td colSpan="4" style={{ ...tdStyle, textAlign: "center" }}>No hay medicos registrados</td></tr>
          ) : (
            medicos.map((medico) => (
              <tr key={medico.id}>
                <td style={tdStyle}>{medico.nombre}</td>
                <td style={tdStyle}>{medico.email}</td>
                <td style={tdStyle}>{medico.especialidad?.nombre || "N/A"}</td>
                <td style={tdStyle}>
                  {medico.horarios?.length ? (
                    medico.horarios.map((horario) => (
                      <div key={horario.id}>{horario.diaSemana} {horario.horaInicio}-{horario.horaFin} ({horario.cupos} cupos)</div>
                    ))
                  ) : (
                    "Sin horarios"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const formStyle = { backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "4px", marginBottom: "20px", display: "grid", gap: "15px", maxWidth: "640px" };
const primaryButtonStyle = { padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const secondaryButtonStyle = { padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };

export default Medicos;