import { useState, useEffect } from "react";
import api from "../services/api.js";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar usuarios al montar
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/pacientes");
      setUsuarios(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Cargando usuarios...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Usuarios (Pacientes)</h1>

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
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td
                colSpan="3"
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                No hay usuarios registrados
              </td>
            </tr>
          ) : (
            usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {usuario.nombre}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {usuario.dni}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {usuario.telefono}
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
