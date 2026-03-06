import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { path: "/dashboard",  label: "Dashboard",  icon: "⬛" },
  { path: "/customers",  label: "Customers",  icon: "👥" },
  { path: "/leads",      label: "Leads",      icon: "🎯" },
  { path: "/deals",      label: "Deals",      icon: "💼" },
  { path: "/tickets",    label: "Tickets",    icon: "🎫" },
  { path: "/analytics",  label: "Analytics",  icon: "📊" },
];

const Sidebar = ({ collapsed }) => {
  const { user } = useAuth();

  const styles = {
    sidebar: {
      position: "fixed", top: 0, left: 0, height: "100vh",
      width: collapsed ? "70px" : "240px",
      background: "#0d1526",
      borderRight: "1px solid #1e2d45",
      transition: "width 0.3s",
      overflow: "hidden",
      zIndex: 100,
      display: "flex", flexDirection: "column",
    },
    logo: {
      padding: "1.5rem 1.2rem",
      borderBottom: "1px solid #1e2d45",
      fontFamily: "sans-serif",
      fontWeight: 800,
      fontSize: "1.1rem",
      background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      whiteSpace: "nowrap",
    },
    nav: { flex: 1, padding: "1rem 0" },
    link: {
      display: "flex", alignItems: "center", gap: "0.8rem",
      padding: "0.75rem 1.2rem",
      color: "#64748b",
      textDecoration: "none",
      fontSize: "0.9rem",
      fontWeight: 500,
      transition: "all 0.2s",
      whiteSpace: "nowrap",
    },
    activeLink: {
      color: "#00d4ff",
      background: "rgba(0, 212, 255, 0.08)",
      borderRight: "3px solid #00d4ff",
    },
    userArea: {
      padding: "1rem 1.2rem",
      borderTop: "1px solid #1e2d45",
      display: "flex", alignItems: "center", gap: "0.8rem",
    },
    avatar: {
      width: "32px", height: "32px", borderRadius: "50%",
      background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.8rem", fontWeight: 700, color: "#fff", flexShrink: 0,
    },
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>{collapsed ? "AI" : "AI SaaS CRM"}</div>
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
          >
            <span style={{ fontSize: "1rem" }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div style={styles.userArea}>
        <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: "0.8rem", color: "#e2e8f0", fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{user?.role}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;