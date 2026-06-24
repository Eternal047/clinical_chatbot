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
import Horarios from "./pages/Horarios.jsx";
import "./styles/theme.css";
import "./App.css";

const NAV_ITEMS = [
  { to: "/citas", label: "Citas", icon: "📅" },
  { to: "/medicos", label: "Médicos", icon: "🩺" },
  { to: "/especialidades", label: "Especialidades", icon: "🏷️" },
  { to: "/horarios", label: "Horarios", icon: "🕐" },
];

function Sidebar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-dot" />
        <span className="sidebar-brand-text">Clínica Admin</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`sidebar-link ${location.pathname === item.to ? "active" : ""}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {isAuthenticated && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-label">Sesión activa</span>
            <span className="sidebar-user-name">{user?.nombre}</span>
          </div>
          <button onClick={logout} className="btn-logout">
            Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/citas" element={<ProtectedRoute><Citas /></ProtectedRoute>} />
      <Route path="/medicos" element={<ProtectedRoute><Medicos /></ProtectedRoute>} />
      <Route path="/especialidades" element={<ProtectedRoute><Especialidades /></ProtectedRoute>} />
      <Route path="/horarios" element={<ProtectedRoute><Horarios /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/citas" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppShell() {
  const location = useLocation();

  if (location.pathname === "/login") {
    return <AppRoutes />;
  }

  return (
    <div className="shell">
      <Sidebar />
      <main className="shell-main">
        <AppRoutes />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
}

export default App;