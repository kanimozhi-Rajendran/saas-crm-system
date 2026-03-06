import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/customers": "Customers",
  "/leads": "AI Lead Scoring",
  "/deals": "Deal Predictions",
  "/tickets": "Support Tickets",
  "/analytics": "Analytics",
};

const Navbar = ({ onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <header style={{
      height: "64px",
      background: "#0d1526",
      borderBottom: "1px solid #1e2d45",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 2rem",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={onToggle}
          style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
        >
          ☰
        </button>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0" }}>
          {pageTitles[location.pathname] || "AI SaaS CRM"}
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{
          fontSize: "0.8rem", color: "#64748b",
          background: "#1e2d45", padding: "0.3rem 0.8rem", borderRadius: "999px"
        }}>
          {user?.role}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
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