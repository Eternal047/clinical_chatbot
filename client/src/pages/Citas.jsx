import { useState, useEffect } from "react";
import api from "../services/api.js";

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/citas");
      setCitas(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar citas");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm("¿Está seguro que desea cancelar esta cita?")) {
      return;
    }

    try {
      await api.patch(`/api/citas/${id}/cancelar`);
      cargarCitas();
    } catch (err) {
      alert(err.response?.data?.error || "Error al cancelar la cita");
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-PE");
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Cargando citas...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Citas</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>
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
              Paciente
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
              }}
            >
              DNI
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
              }}
            >
              Teléfono
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "left",
              }}
            >
              Fecha
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
              Hora
            </th>
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
              Estado
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "center",
              }}
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {citas.length === 0 ? (
            <tr>
              <td
                colSpan="9"
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                No hay citas registradas
              </td>
            </tr>
          ) : (
            citas.map((cita) => (
              <tr key={cita.id}>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {cita.pacienteNombre}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {cita.pacienteDni}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {cita.pacienteTelef}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {formatearFecha(cita.fecha)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {cita.horario?.diaSemana || "N/A"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {cita.horario
                    ? `${cita.horario.horaInicio} - ${cita.horario.horaFin}`
                    : "N/A"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {cita.horario?.medico?.nombre || "N/A"}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor:
                        cita.estado === "ACTIVA" ? "#d4edda" : "#f8d7da",
                      color: cita.estado === "ACTIVA" ? "#155724" : "#721c24",
                    }}
                  >
                    {cita.estado}
                  </span>
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  {cita.estado === "ACTIVA" && (
                    <button
                      onClick={() => handleCancelar(cita.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
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

export default Citas;