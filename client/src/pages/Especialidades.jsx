import { useEffect, useState } from "react";
import api from "../services/api.js";

const obtenerEspecialidadesDesdeMedicos = (medicos) => {
  const especialidades = new Map();

  medicos.forEach((medico) => {
    if (!medico.especialidad?.id) {
      return;
    }

    const actual = especialidades.get(medico.especialidad.id);
    especialidades.set(medico.especialidad.id, {
      ...medico.especialidad,
      medicos: [...(actual?.medicos || []), medico],
    });
  });

  return Array.from(especialidades.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre),
  );
};

const Especialidades = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    cargarEspecialidades();
  }, []);

  const cargarEspecialidades = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/medicos");
      setEspecialidades(obtenerEspecialidadesDesdeMedicos(response.data.data || []));
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar especialidades desde medicos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/api/especialidades", { nombre });
      setNombre("");
      setShowForm(false);
      cargarEspecialidades();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "No se pudo crear la especialidad. Revisa el endpoint /api/especialidades.",
      );
    }
  };

  if (loading) {
    return <div className="loading-state">Cargando especialidades…</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Especialidades</h1>
          <p className="page-subtitle">Especialidades médicas registradas, según los médicos asignados.</p>
        </div>
        <button onClick={() => setShowForm((prev) => !prev)} className="btn btn-primary">
          {showForm ? "Cancelar" : "+ Nueva especialidad"}
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="form-panel">
          <div className="form-grid">
            <div className="field-group">
              <label className="field-label">Nombre de la especialidad</label>
              <input
                className="input"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej. Cardiología"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Guardar especialidad
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th className="text-center">Médicos</th>
              </tr>
            </thead>
            <tbody>
              {especialidades.length === 0 ? (
                <tr>
                  <td colSpan="2" className="empty-state">
                    No hay especialidades visibles desde médicos registrados.
                  </td>
                </tr>
              ) : (
                especialidades.map((especialidad) => (
                  <tr key={especialidad.id}>
                    <td className="cell-strong">{especialidad.nombre}</td>
                    <td className="text-center">
                      <span className="badge badge-neutral">
                        <span className="badge-dot" />
                        {especialidad.medicos?.length || 0}
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

export default Especialidades;