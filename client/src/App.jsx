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
import Usuarios from "./pages/Usuarios.jsx";
import Horarios from "./pages/Horarios.jsx";
import "./App.css";

function NavBar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  // No mostrar navbar en login
  if (location.pathname === "/login") {
    return null;
  }

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
        <Link
          to="/citas"
          style={{ color: "white", textDecoration: "none", cursor: "pointer" }}
        >
          Citas
        </Link>
        <Link
          to="/usuarios"
          style={{ color: "white", textDecoration: "none", cursor: "pointer" }}
        >
          Usuarios
        </Link>
        <Link
          to="/horarios"
          style={{ color: "white", textDecoration: "none", cursor: "pointer" }}
        >
          Horarios
        </Link>
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
      {/* Ruta pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas */}
      <Route
        path="/citas"
        element={
          <ProtectedRoute>
            <Citas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute>
            <Usuarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/horarios"
        element={
          <ProtectedRoute>
            <Horarios />
          </ProtectedRoute>
        }
      />

      {/* Redirigir / a /citas */}
      <Route path="/" element={<Navigate to="/citas" replace />} />

      {/* Ruta no encontrada */}
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
