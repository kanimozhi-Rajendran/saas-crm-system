// ─────────────────────────────────────────────────────────────
//  Login Page
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0a0e1a",
    },
    card: {
      background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "16px",
      padding: "2.5rem", width: "100%", maxWidth: "420px",
    },
    title: {
      fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem",
      background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    },
    input: {
      width: "100%", padding: "0.8rem 1rem", background: "#111827",
      border: "1px solid #1e2d45", borderRadius: "8px", color: "#e2e8f0",
      fontSize: "0.9rem", marginBottom: "1rem", boxSizing: "border-box",
    },
    label: { display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.4rem", fontWeight: 600 },
    btn: {
      width: "100%", padding: "0.9rem", background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
      border: "none", borderRadius: "8px", color: "#fff", fontWeight: 700,
      fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem",
    },
    error: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1rem" },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.title}>AI SaaS CRM</div>
        <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "0.9rem" }}>Sign in to your account</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="you@company.com" />

          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="••••••••" />

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#64748b", fontSize: "0.85rem" }}>
          No account? <Link to="/register" style={{ color: "#00d4ff" }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;