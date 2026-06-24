import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Citas from "./pages/Citas.jsx";
import Medicos from "./pages/Medicos.jsx";
import Especialidades from "./pages/Especialidades.jsx";
import "./App.css";

function NavBar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  if (location.pathname === "/login") {
    return null;
  }

  const linkStyle = { color: "white", textDecoration: "none", cursor: "pointer" };

  return (
    <nav
      style={{
        backgroundColor: "#333",
        padding: "10px 20px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: "20px" }}>
        <Link to="/citas" style={linkStyle}>Citas</Link>
        <Link to="/medicos" style={linkStyle}>Medicos</Link>
        <Link to="/especialidades" style={linkStyle}>Especialidades</Link>
      </div>
      {isAuthenticated && (
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ color: "white" }}>Bienvenido: {user?.nombre}</span>
          <button
            onClick={logout}
            style={{
              padding: "6px 12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/citas" element={<ProtectedRoute><Citas /></ProtectedRoute>} />
      <Route path="/medicos" element={<ProtectedRoute><Medicos /></ProtectedRoute>} />
      <Route path="/especialidades" element={<ProtectedRoute><Especialidades /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/citas" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <NavBar />
          <main>
            <AppRoutes />
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;