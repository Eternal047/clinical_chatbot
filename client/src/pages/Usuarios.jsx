import { useState, useEffect } from "react";
import api from "../services/api.js";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/citas");
      const citas = response.data.data || [];
      const pacientesPorDni = new Map();

      citas.forEach((cita) => {
        if (!cita.pacienteDni) {
          return;
        }

        const existente = pacientesPorDni.get(cita.pacienteDni);
        pacientesPorDni.set(cita.pacienteDni, {
          dni: cita.pacienteDni,
          nombre: cita.pacienteNombre,
          telefono: cita.pacienteTelef,
          citas: (existente?.citas || 0) + 1,
        });
      });

      setUsuarios(Array.from(pacientesPorDni.values()));
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Cargando usuarios...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Usuarios con Citas</h1>

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
              Nombre
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
                textAlign: "center",
              }}
            >
              Citas
            </th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                No hay usuarios con citas registradas
              </td>
            </tr>
          ) : (
            usuarios.map((usuario) => (
              <tr key={usuario.dni}>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {usuario.nombre}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {usuario.dni}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {usuario.telefono}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  {usuario.citas}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Usuarios;