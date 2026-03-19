import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import NotificationBell from "../notifications/NotificationBell";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/customers": "Customers",
  "/leads": "AI Lead Scoring",
  "/deals": "Deal Predictions",
  "/pipeline": "Kanban Pipeline",
  "/tickets": "Support Tickets",
  "/analytics": "Analytics",
  "/ai-insights": "AI Insights",
  "/admin": "Admin Panel"
};

const Navbar = ({ onToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <header style={{
      height: "64px",
      background: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 2rem",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={onToggle}
          style={{ background: "none", border: "none", color: colors.muted, cursor: "pointer", fontSize: "1.2rem" }}
        >
          ☰
        </button>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: colors.text }}>
          {pageTitles[location.pathname] || "AI SaaS CRM"}
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
        
        <button 
          onClick={toggleTheme} 
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: colors.muted, display: "flex", alignItems: "center" }}
          title="Toggle Theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        
        <NotificationBell />

        <span style={{
          fontSize: "0.8rem", color: colors.text,
          background: colors.bg, border: `1px solid ${colors.border}`, padding: "0.3rem 0.8rem", borderRadius: "999px", fontWeight: "600"
        }}>
          {user?.role}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: `1px solid rgba(239, 68, 68, 0.3)`,
            color: "#f87171", padding: "0.4rem 1rem", borderRadius: "8px",
            cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;