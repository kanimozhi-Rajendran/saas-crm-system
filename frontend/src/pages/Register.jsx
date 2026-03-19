import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiUser } from "react-icons/fi";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Sales" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: { 
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", 
      background: "radial-gradient(circle at 50% -20%, #1e2d45 0%, #0a0e1a 60%)" 
    },
    card: { 
      background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "16px", 
      padding: "2.5rem", width: "100%", maxWidth: "440px",
      boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    },
    title: { 
      fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", 
      background: "linear-gradient(135deg, #00d4ff, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" 
    },
    inputWrapper: { position: "relative", marginBottom: "1.2rem" },
    icon: { position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "1.1rem" },
    input: { 
      width: "100%", padding: "0.9rem 1rem 0.9rem 2.8rem", background: "#111827", 
      border: "1px solid #1e2d45", borderRadius: "8px", color: "#e2e8f0", 
      fontSize: "0.95rem", boxSizing: "border-box", transition: "all 0.2s ease",
    },
    selectInput: {
      width: "100%", padding: "0.9rem 1rem", background: "#111827", 
      border: "1px solid #1e2d45", borderRadius: "8px", color: "#e2e8f0", 
      fontSize: "0.95rem", boxSizing: "border-box", transition: "all 0.2s ease", marginBottom: "1.2rem"
    },
    label: { display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.5rem", fontWeight: 600 },
    btn: { 
      width: "100%", height: "48px", background: "linear-gradient(135deg, #4F6EF7, #7c3aed)", 
      border: "none", borderRadius: "8px", color: "#fff", fontWeight: 700, 
      fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem", transition: "all 0.2s ease" 
    },
    error: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.title}>Create Account</div>
        <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "0.9rem" }}>Join AI SaaS CRM</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Full Name</label>
          <div style={s.inputWrapper}>
            <FiUser style={{ ...s.icon, color: focus === "name" ? "#00d4ff" : "#64748b" }} />
            <input 
              style={{ ...s.input, boxShadow: focus === "name" ? "0 0 0 2px rgba(0,212,255,0.2)" : "none" }} 
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
              onFocus={() => setFocus("name")} onBlur={() => setFocus(null)}
              required placeholder="Jane Smith" 
            />
          </div>

          <label style={s.label}>Email</label>
          <div style={s.inputWrapper}>
            <FiMail style={{ ...s.icon, color: focus === "email" ? "#00d4ff" : "#64748b" }} />
            <input 
              style={{ ...s.input, boxShadow: focus === "email" ? "0 0 0 2px rgba(0,212,255,0.2)" : "none" }} 
              type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} 
              onFocus={() => setFocus("email")} onBlur={() => setFocus(null)}
              required placeholder="you@company.com" 
            />
          </div>

          <label style={s.label}>Password</label>
          <div style={s.inputWrapper}>
            <FiLock style={{ ...s.icon, color: focus === "password" ? "#00d4ff" : "#64748b" }} />
            <input 
              style={{ ...s.input, boxShadow: focus === "password" ? "0 0 0 2px rgba(0,212,255,0.2)" : "none" }} 
              type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} 
              onFocus={() => setFocus("password")} onBlur={() => setFocus(null)}
              required placeholder="Min 6 characters" 
            />
          </div>

          <label style={s.label}>Role</label>
          <select 
            style={{ ...s.selectInput, boxShadow: focus === "role" ? "0 0 0 2px rgba(0,212,255,0.2)" : "none" }} 
            value={form.role} onChange={e => setForm({...form, role: e.target.value})}
            onFocus={() => setFocus("role")} onBlur={() => setFocus(null)}
          >
            <option value="Sales">Sales</option>
            <option value="Support">Support</option>
            <option value="Admin">Admin</option>
          </select>

          <button 
            style={s.btn} type="submit" disabled={loading}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} 
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#64748b", fontSize: "0.85rem" }}>
          Already have an account? <Link to="/login" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;