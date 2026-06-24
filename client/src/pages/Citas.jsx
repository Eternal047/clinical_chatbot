import { useEffect, useState } from "react";
import api from "../services/api.js";

const dias = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
};

const PREFIJO_PERU = "+51";

const StatusBadge = ({ estado }) => {
  const isActiva = estado === "ACTIVA";
  return (
    <span className={`badge ${isActiva ? "badge-success" : "badge-danger"}`}>
      <span className="badge-dot" />
      {estado}
    </span>
  );
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
    cargarDatos({ mostrarLoading: true });

    // Refresca la lista de citas automáticamente cada 10s,
    // sin mostrar el spinner de carga ni interrumpir al usuario.
    const intervalId = setInterval(() => {
      cargarDatos({ mostrarLoading: false });
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const cargarDatos = async ({ mostrarLoading } = { mostrarLoading: false }) => {
    try {
      if (mostrarLoading) setLoading(true);
      const [citasResponse, horariosResponse] = await Promise.all([
        api.get("/api/citas"),
        api.get("/api/horarios"),
      ]);
      setCitas(citasResponse.data.data || []);
      setHorarios(horariosResponse.data.data || []);
      setError("");
    } catch (err) {
      // En refrescos silenciosos no mostramos error para no alarmar
      // si hay un fallo puntual de red; solo lo mostramos en la carga inicial.
      if (mostrarLoading) {
        setError(err.response?.data?.error || "Error al cargar citas");
      }
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // El input solo captura los dígitos locales; el +51 se concatena al enviar.
  const handleTelefonoChange = (event) => {
    const soloDigitos = event.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, pacienteTelef: soloDigitos }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post("/api/citas", {
        ...formData,
        pacienteTelef: `${PREFIJO_PERU}${formData.pacienteTelef}`,
      });
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
    if (!window.confirm("¿Está seguro que desea cancelar esta cita?")) return;

    try {
      await api.patch(`/api/citas/${id}/cancelar`);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || "Error al cancelar cita");
    }
  };

  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString("es-PE");

  if (loading) {
    return <div className="loading-state">Cargando citas…</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Citas</h1>
          <p className="page-subtitle">Gestiona las citas registradas por el chatbot y el panel administrativo.</p>
        </div>
        <button onClick={() => setShowForm((prev) => !prev)} className="btn btn-primary">
          {showForm ? "Cancelar" : "+ Nueva cita"}
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="form-panel">
          <div className="form-grid">
            <div className="form-grid-2col">
              <div className="field-group">
                <label className="field-label">Nombre del paciente</label>
                <input
                  className="input"
                  name="pacienteNombre"
                  value={formData.pacienteNombre}
                  onChange={handleChange}
                  placeholder="Ej. Ana Torres Reyes"
                  required
                />
              </div>
              <div className="field-group">
                <label className="field-label">DNI</label>
                <input
                  className="input"
                  name="pacienteDni"
                  value={formData.pacienteDni}
                  onChange={handleChange}
                  placeholder="8 dígitos"
                  required
                />
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="field-group">
                <label className="field-label">Teléfono</label>
                <div className="input-phone-group">
                  <span className="input-phone-prefix">{PREFIJO_PERU}</span>
                  <input
                    className="input"
                    name="pacienteTelef"
                    value={formData.pacienteTelef}
                    onChange={handleTelefonoChange}
                    placeholder="961219063"
                    inputMode="numeric"
                    maxLength={9}
                    required
                  />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Fecha</label>
                <input
                  className="input"
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Horario</label>
              <select
                className="input"
                name="horarioId"
                value={formData.horarioId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar horario</option>
                {horarios.map((horario) => (
                  <option key={horario.id} value={horario.id}>
                    {horario.medico?.nombre} — {dias[horario.diaSemana] || horario.diaSemana} {horario.horaInicio}-{horario.horaFin}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Guardar cita
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Médico</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    No hay citas registradas todavía.
                  </td>
                </tr>
              ) : (
                citas.map((cita) => (
                  <tr key={cita.id}>
                    <td className="cell-strong">{cita.pacienteNombre}</td>
                    <td className="cell-muted">{cita.pacienteDni}</td>
                    <td className="cell-muted">{cita.pacienteTelef}</td>
                    <td className="cell-muted">{formatearFecha(cita.fecha)}</td>
                    <td className="cell-muted">
                      {cita.horario
                        ? `${dias[cita.horario.diaSemana] || cita.horario.diaSemana} ${cita.horario.horaInicio}-${cita.horario.horaFin}`
                        : "N/A"}
                    </td>
                    <td>{cita.horario?.medico?.nombre || "N/A"}</td>
                    <td>
                      <StatusBadge estado={cita.estado} />
                    </td>
                    <td className="text-center">
                      {cita.estado === "ACTIVA" && (
                        <button onClick={() => handleCancelar(cita.id)} className="btn btn-danger-ghost">
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
      </div>
    </div>
  );
};

export default Citas;