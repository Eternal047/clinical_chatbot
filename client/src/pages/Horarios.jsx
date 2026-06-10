import { useState, useEffect } from "react";
import api from "../services/api.js";

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

  // Cargar horarios y médicos al montar
  useEffect(() => {
    cargarHorarios();
    cargarMedicos();
  }, []);

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      // Obtener del endpoint disponibles para tener datos formateados
      const response = await api.get("/api/horarios/disponibles");
      setHorarios(response.data.data || []);
      setError("");
    } catch (err) {
      // Si el endpoint no existe, intentar otro
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

  const diasSemana = [
    "LUNES",
    "MARTES",
    "MIERCOLES",
    "JUEVES",
    "VIERNES",
    "SABADO",
  ];

  if (loading) {
    return <div style={{ padding: "20px" }}>Cargando horarios...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Horarios</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
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
        {showForm ? "Cancelar" : "Crear Nuevo Horario"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "4px",
            marginBottom: "20px",
            maxWidth: "500px",
          }}
        >
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="medicoId"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Médico:
            </label>
            <select
              id="medicoId"
              name="medicoId"
              value={formData.medicoId}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            >
              <option value="">Seleccionar médico</option>
              {medicos.map((medico) => (
                <option key={medico.id} value={medico.id}>
                  {medico.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="diaSemana"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Día de la Semana:
            </label>
            <select
              id="diaSemana"
              name="diaSemana"
              value={formData.diaSemana}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            >
              <option value="">Seleccionar día</option>
              {diasSemana.map((dia) => (
                <option key={dia} value={dia}>
                  {dia}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="horaInicio"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Hora Inicio:
            </label>
            <input
              id="horaInicio"
              type="time"
              name="horaInicio"
              value={formData.horaInicio}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="horaFin"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Hora Fin:
            </label>
            <input
              id="horaFin"
              type="time"
              name="horaFin"
              value={formData.horaFin}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="cupos"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Cupos:
            </label>
            <input
              id="cupos"
              type="number"
              name="cupos"
              value={formData.cupos}
              onChange={handleInputChange}
              required
              min="1"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Crear Horario
          </button>
        </form>
      )}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
              }}
            >
              Médico
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
              }}
            >
              Día
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
              }}
            >
              Hora Inicio
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
              }}
            >
              Hora Fin
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "center",
              }}
            >
              Cupos
            </th>
          </tr>
        </thead>
        <tbody>
          {horarios.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                No hay horarios registrados
              </td>
            </tr>
          ) : (
            horarios.map((horario) => (
              <tr key={horario.id}>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {horario.medico?.nombre || "N/A"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {horario.diaSemana}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {horario.horaInicio}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {horario.horaFin}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  {horario.cupos}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Horarios;
