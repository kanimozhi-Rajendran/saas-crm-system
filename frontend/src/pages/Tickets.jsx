// ─────────────────────────────────────────────────────────────
//  Tickets Page — Support Tickets
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { ticketsAPI } from "../utils/api";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "Medium", category: "General" });

  const fetchTickets = async () => {
    setLoading(true);
    try { const { data } = await ticketsAPI.getAll(); setTickets(data.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await ticketsAPI.create(form); fetchTickets(); setShowForm(false); setForm({ title: "", description: "", priority: "Medium", category: "General" }); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await ticketsAPI.update(id, { status }); fetchTickets(); }
    catch (err) { alert("Error updating"); }
  };

  const priorityColor = (p) => ({ Low: "#10b981", Medium: "#f59e0b", High: "#ef4444", Critical: "#dc2626" })[p] || "#64748b";
  const statusColor = (s) => ({ Open: "#ef4444", "In Progress": "#f59e0b", Resolved: "#10b981", Closed: "#64748b" })[s] || "#64748b";

  const s = {
    btn: { background: "linear-gradient(135deg, #00d4ff, #7c3aed)", border: "none", color: "#fff", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontWeight: 700 },
    table: { width: "100%", borderCollapse: "collapse", background: "#0d1526", borderRadius: "12px", overflow: "hidden" },
    th: { padding: "0.9rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", background: "#111827", borderBottom: "1px solid #1e2d45" },
    td: { padding: "1rem", borderBottom: "1px solid #1e2d4530", fontSize: "0.85rem", color: "#e2e8f0" },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
    modal: { background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "480px" },
    formInput: { width: "100%", padding: "0.7rem 0.9rem", background: "#111827", border: "1px solid #1e2d45", borderRadius: "8px", color: "#e2e8f0", fontSize: "0.85rem", marginBottom: "1rem", boxSizing: "border-box" },
    label: { display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.3rem", fontWeight: 600 },
  };

  return (
    <div style={{ color: "#e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Support Tickets</h2>
        <button style={s.btn} onClick={() => setShowForm(true)}>+ New Ticket</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={s.table}>
          <thead><tr>{["Title","Category","Priority","Status","Resolution Time","Update Status"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading...</td></tr>
            ) : tickets.map((t) => (
              <tr key={t._id}>
                <td style={s.td}><div style={{ fontWeight: 600 }}>{t.title}</div></td>
                <td style={s.td}>{t.category}</td>
                <td style={s.td}><span style={{ background: `${priorityColor(t.priority)}22`, color: priorityColor(t.priority), padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>{t.priority}</span></td>
                <td style={s.td}><span style={{ background: `${statusColor(t.status)}22`, color: statusColor(t.status), padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>{t.status}</span></td>
                <td style={s.td}>{t.resolutionTimeHours != null ? `${t.resolutionTimeHours}h` : "—"}</td>
                <td style={s.td}>
                  <select
                    value={t.status}
                    onChange={e => handleStatusUpdate(t._id, e.target.value)}
                    style={{ ...s.formInput, marginBottom: 0, padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                  >
                    {["Open","In Progress","Resolved","Closed"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={s.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 style={{ fontWeight: 800 }}>New Ticket</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <label style={s.label}>Title</label>
              <input style={s.formInput} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              <label style={s.label}>Description</label>
              <textarea style={{ ...s.formInput, height: "100px", resize: "vertical" }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={s.label}>Priority</label>
                  <select style={s.formInput} value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    {["Low","Medium","High","Critical"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Category</label>
                  <select style={s.formInput} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {["Technical","Billing","Feature Request","General","Bug"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" style={{ ...s.btn, width: "100%", padding: "0.8rem" }}>Create Ticket</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
