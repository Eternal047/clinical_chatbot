import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/citas");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="sidebar-brand-dot" />
          <span className="sidebar-brand-text">Clínica Admin</span>
        </div>

        <h1 className="login-title">Iniciar sesión</h1>
        <p className="login-subtitle">Ingresa tus credenciales para acceder al panel.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field-group">
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="alert-error">{error}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? "Iniciando sesión…" : "Iniciar sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;