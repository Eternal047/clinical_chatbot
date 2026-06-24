import { useState, useEffect } from "react";
import api from "../services/api.js";

const diasSemana = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

const Horarios = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [medicos, setMedicos] = useState([]);
  const [formData, setFormData] = useState({
    medicoId: "",
    diaSemana: "",
    horaInicio: "",
    horaFin: "",
    cupos: "",
  });

  useEffect(() => {
    cargarHorarios();
    cargarMedicos();
  }, []);

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/horarios/disponibles");
      setHorarios(response.data.data || []);
      setError("");
    } catch (err) {
      setError("Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  };

  const cargarMedicos = async () => {
    try {
      const response = await api.get("/api/medicos");
      setMedicos(response.data.data || []);
    } catch (err) {
      console.error("Error al cargar médicos:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.medicoId ||
      !formData.diaSemana ||
      !formData.horaInicio ||
      !formData.horaFin ||
      !formData.cupos
    ) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      await api.post("/api/horarios", {
        medicoId: formData.medicoId,
        diaSemana: formData.diaSemana,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        cupos: parseInt(formData.cupos),
      });

      setFormData({
        medicoId: "",
        diaSemana: "",
        horaInicio: "",
        horaFin: "",
        cupos: "",
      });
      setShowForm(false);
      cargarHorarios();
    } catch (err) {
      alert(err.response?.data?.error || "Error al crear horario");
    }
  };

  if (loading) {
    return <div className="loading-state">Cargando horarios…</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Horarios</h1>
          <p className="page-subtitle">Bloques de atención disponibles por médico y día.</p>
        </div>
        <button onClick={() => setShowForm((prev) => !prev)} className="btn btn-primary">
          {showForm ? "Cancelar" : "+ Nuevo horario"}
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="form-panel">
          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">Médico</label>
              <select
                name="medicoId"
                value={formData.medicoId}
                onChange={handleInputChange}
                required
                className="input"
              >
                <option value="">Seleccionar médico</option>
                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    {medico.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Día de la semana</label>
              <select
                name="diaSemana"
                value={formData.diaSemana}
                onChange={handleInputChange}
                required
                className="input"
              >
                <option value="">Seleccionar día</option>
                {diasSemana.map((dia) => (
                  <option key={dia} value={dia}>
                    {dia}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid-2col">
              <div className="field-group">
                <label className="field-label">Hora inicio</label>
                <input
                  type="time"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Hora fin</label>
                <input
                  type="time"
                  name="horaFin"
                  value={formData.horaFin}
                  onChange={handleInputChange}
                  required
                  className="input"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Cupos</label>
              <input
                type="number"
                name="cupos"
                value={formData.cupos}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="Ej. 10"
                className="input"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Crear horario
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Médico</th>
                <th>Día</th>
                <th>Hora inicio</th>
                <th>Hora fin</th>
                <th className="text-center">Cupos</th>
              </tr>
            </thead>
            <tbody>
              {horarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No hay horarios registrados todavía.
                  </td>
                </tr>
              ) : (
                horarios.map((horario) => (
                  <tr key={horario.id}>
                    <td className="cell-strong">{horario.medico?.nombre || "N/A"}</td>
                    <td className="cell-muted">{horario.diaSemana}</td>
                    <td className="cell-muted">{horario.horaInicio}</td>
                    <td className="cell-muted">{horario.horaFin}</td>
                    <td className="text-center">
                      <span className="badge badge-neutral">
                        <span className="badge-dot" />
                        {horario.cupos}
                      </span>
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

export default Horarios;