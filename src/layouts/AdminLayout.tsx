import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSiteSettings } from "../context/SiteSettingsContext";
import "./AdminLayout.css";

export default function AdminLayout() {
  const { session, loading, signOut } = useAuth();
  const { settings } = useSiteSettings();

  if (loading) {
    return <div className="admin-gate">Cargando…</div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link to="/admin" className="admin-header-logo">
          {settings.businessName}
        </Link>

        <div className="admin-header-actions">
          <Link to="/admin/clientes" className="admin-header-icon" aria-label="Clientes" title="Clientes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
            </svg>
          </Link>
          <Link to="/admin/resenas" className="admin-header-icon" aria-label="Reseñas" title="Reseñas">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2.5l2.94 6.3 6.86.7-5.1 4.72 1.44 6.78L12 17.9l-6.14 3.1 1.44-6.78-5.1-4.72 6.86-.7L12 2.5Z" />
            </svg>
          </Link>
          <Link to="/admin/cupones" className="admin-header-icon" aria-label="Cupones" title="Cupones">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
              <path d="M10 6v12" strokeDasharray="2 3" />
            </svg>
          </Link>
          <Link to="/admin/configuracion" className="admin-header-icon" aria-label="Configuración" title="Configuración">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.96 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.7 8.96a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9.1A1.7 1.7 0 0 0 10.14 3V3a2 2 0 1 1 4 0v.09c0 .66.4 1.26 1.04 1.51.6.24 1.3.11 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9.1c.25.64.85 1.04 1.51 1.04H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.04Z" />
            </svg>
          </Link>

          <span className="admin-header-sep" />

          <Link to="/" target="_blank" className="admin-header-link">
            Ver sitio
          </Link>
          <button className="admin-header-link" onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="admin-content">
        <Outlet />
      </div>

      <nav className="admin-tabbar">
        <NavLink to="/admin" end>
          Panel
        </NavLink>
        <NavLink to="/admin/productos">Productos</NavLink>
        <NavLink to="/admin/categorias">Categorías</NavLink>
        <NavLink to="/admin/pedidos">Pedidos</NavLink>
      </nav>
    </div>
  );
}
