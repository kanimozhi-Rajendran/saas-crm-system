import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { FiGrid, FiUsers, FiTarget, FiBriefcase, FiLifeBuoy, FiBarChart2, FiColumns, FiZap, FiSettings } from "react-icons/fi";

const navItems = [
  { path: "/dashboard",  label: "Dashboard",  icon: <FiGrid /> },
  { path: "/customers",  label: "Customers",  icon: <FiUsers /> },
  { path: "/leads",      label: "Leads",      icon: <FiTarget /> },
  { path: "/deals",      label: "Deals",      icon: <FiBriefcase /> },
  { path: "/pipeline",   label: "Pipeline",   icon: <FiColumns /> },
  { path: "/tickets",    label: "Tickets",    icon: <FiLifeBuoy /> },
  { path: "/analytics",  label: "Analytics",  icon: <FiBarChart2 /> },
  { path: "/ai-insights",label: "AI Insights",icon: <FiZap /> },
  { path: "/admin",      label: "Admin Panel",icon: <FiSettings />, adminOnly: true },
];

const Sidebar = ({ collapsed }) => {
  const { user } = useAuth();
  const { colors } = useTheme();

  const styles = {
    sidebar: {
      position: "fixed", top: 0, left: 0, height: "100vh",
      width: collapsed ? "70px" : "240px",
      background: colors.surface,
      borderRight: `1px solid ${colors.border}`,
      transition: "width 0.3s",
      overflow: "hidden",
      zIndex: 100,
      display: "flex", flexDirection: "column",
    },
    logoContainer: {
      padding: "1.5rem 1.2rem",
      borderBottom: `1px solid ${colors.border}`,
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    logoIcon: {
      fontSize: "1.5rem",
      color: "#00d4ff",
      display: "flex",
    },
    logoText: {
      fontFamily: "sans-serif",
      fontWeight: 800,
      fontSize: "1.2rem",
      background: `linear-gradient(135deg, #00d4ff, #7c3aed)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      whiteSpace: "nowrap",
    },
    nav: { flex: 1, padding: "1rem 0", overflowY: "auto" },
    link: {
      display: "flex", alignItems: "center", gap: "0.8rem",
      padding: "0.75rem 1.2rem",
      color: colors.muted,
      textDecoration: "none",
      fontSize: "0.9rem",
      fontWeight: 500,
      transition: "all 0.2s ease",
      whiteSpace: "nowrap",
      borderLeft: "3px solid transparent",
    },
    activeLink: {
      color: "#00d4ff",
      background: "rgba(0, 212, 255, 0.08)",
      borderLeft: `3px solid #00d4ff`,
    },
    userArea: {
      padding: "1.2rem",
      borderTop: `1px solid ${colors.border}`,
      display: "flex", alignItems: "center", gap: "0.8rem",
    },
    avatar: {
      width: "36px", height: "36px", borderRadius: "50%",
      background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.9rem", fontWeight: 700, color: "#fff", flexShrink: 0,
    },
    rolePill: {
      fontSize: "0.65rem",
      fontWeight: 700,
      background: "rgba(124, 58, 237, 0.15)",
      color: "#7c3aed",
      padding: "0.1rem 0.4rem",
      borderRadius: "999px",
      marginTop: "0.2rem",
      display: "inline-block",
    }
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <FiZap />
        </div>
        {!collapsed && <div style={styles.logoText}>AI CRM</div>}
      </div>
      <nav style={styles.nav}>
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== "Admin") return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.style.borderLeft.includes("#00d4ff")) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.style.borderLeft.includes("#00d4ff")) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "1.1rem", flexShrink: 0, display: "flex" }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div style={styles.userArea}>
        <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
        {!collapsed && (
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ fontSize: "0.85rem", color: colors.text, fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {user?.name || "User"}
            </div>
            <div>
              <span style={styles.rolePill}>{user?.role || "Guest"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;