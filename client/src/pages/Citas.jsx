import { useEffect, useState } from "react";
import api from "../services/api.js";

const dias = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miercoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sabado",
};

const estadoStyle = (estado) => ({
  padding: "4px 8px",
  borderRadius: "4px",
  backgroundColor: estado === "ACTIVA" ? "#d4edda" : "#f8d7da",
  color: estado === "ACTIVA" ? "#155724" : "#721c24",
});

const inputStyle = {
  width: "100%",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  boxSizing: "border-box",
};

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pacienteNombre: "",
    pacienteDni: "",
    pacienteTelef: "",
    horarioId: "",
    fecha: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [citasResponse, horariosResponse] = await Promise.all([
        api.get("/api/citas"),
        api.get("/api/horarios"),
      ]);
      setCitas(citasResponse.data.data || []);
      setHorarios(horariosResponse.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar citas");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post("/api/citas", formData);
      setFormData({
        pacienteNombre: "",
        pacienteDni: "",
        pacienteTelef: "",
        horarioId: "",
        fecha: "",
      });
      setShowForm(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || "Error al crear cita");
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm("Esta seguro que desea cancelar esta cita?")) return;

    try {
      await api.patch(`/api/citas/${id}/cancelar`);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || "Error al cancelar cita");
    }
  };

  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString("es-PE");

  if (loading) {
    return <div style={{ padding: "20px" }}>Cargando citas...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestion de Citas</h1>
      {error && <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>}

      <button
        onClick={() => setShowForm((prev) => !prev)}
        style={{
          padding: "8px 16px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        {showForm ? "Cancelar" : "Crear Nueva Cita"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "4px",
            marginBottom: "20px",
            display: "grid",
            gap: "15px",
            maxWidth: "720px",
          }}
        >
          <input
            name="pacienteNombre"
            value={formData.pacienteNombre}
            onChange={handleChange}
            placeholder="Nombre del paciente"
            required
            style={inputStyle}
          />
          <input
            name="pacienteDni"
            value={formData.pacienteDni}
            onChange={handleChange}
            placeholder="DNI"
            required
            style={inputStyle}
          />
          <input
            name="pacienteTelef"
            value={formData.pacienteTelef}
            onChange={handleChange}
            placeholder="Telefono"
            required
            style={inputStyle}
          />
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <select
            name="horarioId"
            value={formData.horarioId}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Seleccionar horario</option>
            {horarios.map((horario) => (
              <option key={horario.id} value={horario.id}>
                {horario.medico?.nombre} - {dias[horario.diaSemana] || horario.diaSemana} {horario.horaInicio}-{horario.horaFin}
              </option>
            ))}
          </select>
          <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>
            Guardar Cita
          </button>
        </form>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={thStyle}>Paciente</th>
            <th style={thStyle}>DNI</th>
            <th style={thStyle}>Telefono</th>
            <th style={thStyle}>Fecha</th>
            <th style={thStyle}>Horario</th>
            <th style={thStyle}>Medico</th>
            <th style={thStyle}>Estado</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {citas.length === 0 ? (
            <tr>
              <td colSpan="8" style={emptyStyle}>No hay citas registradas</td>
            </tr>
          ) : (
            citas.map((cita) => (
              <tr key={cita.id}>
                <td style={tdStyle}>{cita.pacienteNombre}</td>
                <td style={tdStyle}>{cita.pacienteDni}</td>
                <td style={tdStyle}>{cita.pacienteTelef}</td>
                <td style={tdStyle}>{formatearFecha(cita.fecha)}</td>
                <td style={tdStyle}>
                  {cita.horario
                    ? `${dias[cita.horario.diaSemana] || cita.horario.diaSemana} ${cita.horario.horaInicio}-${cita.horario.horaFin}`
                    : "N/A"}
                </td>
                <td style={tdStyle}>{cita.horario?.medico?.nombre || "N/A"}</td>
                <td style={tdStyle}><span style={estadoStyle(cita.estado)}>{cita.estado}</span></td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {cita.estado === "ACTIVA" && (
                    <button onClick={() => handleCancelar(cita.id)} style={dangerButtonStyle}>
                      Cancelar
                    </button>
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

const thStyle = { border: "1px solid #ddd", padding: "10px", textAlign: "left" };
const tdStyle = { border: "1px solid #ddd", padding: "10px" };
const emptyStyle = { ...tdStyle, textAlign: "center" };
const dangerButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default Citas;