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
    return <div style={{ padding: "20px" }}>Cargando especialidades...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Especialidades</h1>
      {error && <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>}

      <button onClick={() => setShowForm((prev) => !prev)} style={buttonStyle}>
        {showForm ? "Cancelar" : "Crear Especialidad"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Nombre de la especialidad"
            required
            style={inputStyle}
          />
          <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>
            Guardar Especialidad
          </button>
        </form>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={thStyle}>Nombre</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Medicos</th>
          </tr>
        </thead>
        <tbody>
          {especialidades.length === 0 ? (
            <tr>
              <td colSpan="2" style={{ ...tdStyle, textAlign: "center" }}>
                No hay especialidades visibles desde medicos registrados
              </td>
            </tr>
          ) : (
            especialidades.map((especialidad) => (
              <tr key={especialidad.id}>
                <td style={tdStyle}>{especialidad.nombre}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {especialidad.medicos?.length || 0}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginBottom: "20px",
};
const formStyle = {
  backgroundColor: "#f9f9f9",
  padding: "20px",
  borderRadius: "4px",
  marginBottom: "20px",
  display: "grid",
  gap: "15px",
  maxWidth: "500px",
};
const inputStyle = {
  width: "100%",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  boxSizing: "border-box",
};
const thStyle = { border: "1px solid #ddd", padding: "10px", textAlign: "left" };
const tdStyle = { border: "1px solid #ddd", padding: "10px" };

export default Especialidades;