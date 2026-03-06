// ─────────────────────────────────────────────────────────────
//  Customers Page — Full CRUD
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { customersAPI } from "../utils/api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", companySize: "11-50", industry: "", status: "Prospect" });

  const fetchCustomers = async () => {
    setLoading(true);
    try { const { data } = await customersAPI.getAll(); setCustomers(data.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await customersAPI.create(form); fetchCustomers(); setShowForm(false); setForm({ name: "", email: "", phone: "", company: "", companySize: "11-50", industry: "", status: "Prospect" }); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try { await customersAPI.delete(id); fetchCustomers(); }
    catch (err) { alert(err.response?.data?.message || "Error deleting"); }
  };

  const statusColor = (s) => ({ Active: "#10b981", Inactive: "#ef4444", Prospect: "#f59e0b" })[s] || "#64748b";

  const s = {
    btn: { background: "linear-gradient(135deg, #00d4ff, #7c3aed)", border: "none", color: "#fff", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontWeight: 700 },
    table: { width: "100%", borderCollapse: "collapse", background: "#0d1526", borderRadius: "12px", overflow: "hidden" },
    th: { padding: "0.9rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", background: "#111827", borderBottom: "1px solid #1e2d45" },
    td: { padding: "1rem", borderBottom: "1px solid #1e2d4530", fontSize: "0.85rem", color: "#e2e8f0" },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
    modal: { background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "480px" },
    formInput: { width: "100%", padding: "0.7rem 0.9rem", background: "#111827", border: "1px solid #1e2d45", borderRadius: "8px", color: "#e2e8f0", fontSize: "0.85rem", marginBottom: "1rem", boxSizing: "border-box" },
    label: { display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.3rem", fontWeight: 600 },
    delBtn: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "0.3rem 0.7rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem" },
  };

  return (
    <div style={{ color: "#e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Customers</h2>
        <button style={s.btn} onClick={() => setShowForm(true)}>+ New Customer</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={s.table}>
          <thead>
            <tr>{["Name","Company","Industry","Size","Status","Revenue","Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading...</td></tr>
            ) : customers.map((c) => (
              <tr key={c._id}>
                <td style={s.td}><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ color: "#64748b", fontSize: "0.75rem" }}>{c.email}</div></td>
                <td style={s.td}>{c.company}</td>
                <td style={s.td}>{c.industry}</td>
                <td style={s.td}>{c.companySize}</td>
                <td style={s.td}><span style={{ background: `${statusColor(c.status)}22`, color: statusColor(c.status), padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>{c.status}</span></td>
                <td style={s.td}>${c.totalRevenue?.toLocaleString()}</td>
                <td style={s.td}><button style={s.delBtn} onClick={() => handleDelete(c._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={s.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 style={{ fontWeight: 800 }}>New Customer</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              {[["name","Name"],["email","Email"],["phone","Phone"],["company","Company"],["industry","Industry"]].map(([key,lbl]) => (
                <div key={key}><label style={s.label}>{lbl}</label><input style={s.formInput} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} required={["name","email"].includes(key)} /></div>
              ))}
              <label style={s.label}>Company Size</label>
              <select style={s.formInput} value={form.companySize} onChange={e => setForm({...form, companySize: e.target.value})}>
                {["1-10","11-50","51-200","201-500","500+"].map(s => <option key={s}>{s}</option>)}
              </select>
              <button type="submit" style={{ ...s.btn, width: "100%", padding: "0.8rem" }}>Create Customer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
