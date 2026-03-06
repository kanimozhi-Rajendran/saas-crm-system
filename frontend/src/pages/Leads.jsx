// ─────────────────────────────────────────────────────────────
//  Leads Page — AI Lead Scoring Interface
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { leadsAPI } from "../utils/api";

const ScoreBadge = ({ score, category }) => {
  const colors = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444" };
  const color = colors[category] || "#64748b";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ width: "60px", height: "6px", background: "#1e2d45", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: "3px", transition: "width 0.5s" }} />
      </div>
      <span style={{ fontWeight: 700, color, fontSize: "0.85rem" }}>{score}</span>
      <span style={{ background: `${color}22`, color, padding: "0.1rem 0.5rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700 }}>{category}</span>
    </div>
  );
};

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ category: "", status: "" });
  const [form, setForm] = useState({
    name: "", email: "", company: "", budget: "", companySize: "11-50",
    interactionCount: 0, emailResponseRate: 0, previousConversion: false,
    source: "Website", status: "New", notes: "",
  });
  const [aiResult, setAiResult] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await leadsAPI.getAll(filter);
      setLeads(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await leadsAPI.create(form);
      setAiResult(data.ai);
      fetchLeads();
      setShowForm(false);
      setForm({ name: "", email: "", company: "", budget: "", companySize: "11-50", interactionCount: 0, emailResponseRate: 0, previousConversion: false, source: "Website", status: "New", notes: "" });
    } catch (err) { alert(err.response?.data?.message || "Error creating lead"); }
  };

  const s = {
    container: { color: "#e2e8f0" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
    btn: { background: "linear-gradient(135deg, #00d4ff, #7c3aed)", border: "none", color: "#fff", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontWeight: 700 },
    table: { width: "100%", borderCollapse: "collapse", background: "#0d1526", borderRadius: "12px", overflow: "hidden" },
    th: { padding: "0.9rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", background: "#111827", borderBottom: "1px solid #1e2d45" },
    td: { padding: "1rem", borderBottom: "1px solid #1e2d4530", fontSize: "0.85rem" },
    input: { padding: "0.6rem 0.9rem", background: "#111827", border: "1px solid #1e2d45", borderRadius: "8px", color: "#e2e8f0", fontSize: "0.85rem" },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
    modal: { background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "540px", maxHeight: "90vh", overflowY: "auto" },
    formInput: { width: "100%", padding: "0.7rem 0.9rem", background: "#111827", border: "1px solid #1e2d45", borderRadius: "8px", color: "#e2e8f0", fontSize: "0.85rem", marginBottom: "1rem", boxSizing: "border-box" },
    label: { display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.3rem", fontWeight: 600 },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.2rem" }}>AI Lead Scoring</h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Leads are automatically scored using AI (0-100)</p>
        </div>
        <button style={s.btn} onClick={() => setShowForm(true)}>+ New Lead</button>
      </div>

      {/* AI Result Toast */}
      {aiResult && (
        <div style={{ background: "#0d1526", border: "1px solid #10b981", borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#34d399" }}>🤖 AI Score: <strong>{aiResult.score}</strong> — Category: <strong>{aiResult.category}</strong></span>
          <button onClick={() => setAiResult(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <select style={s.input} value={filter.category} onChange={e => setFilter({...filter, category: e.target.value})}>
          <option value="">All Categories</option>
          <option value="High">High (71-100)</option>
          <option value="Medium">Medium (41-70)</option>
          <option value="Low">Low (0-40)</option>
        </select>
        <select style={s.input} value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
          <option value="">All Statuses</option>
          {["New","Contacted","Qualified","Proposal","Converted","Lost"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Name","Company","Budget","Source","Status","AI Score","Interactions"].map(h =>
                <th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading...</td></tr>
            ) : leads.map((lead) => (
              <tr key={lead._id} style={{ transition: "background 0.2s" }}>
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{lead.name}</div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{lead.email}</div>
                </td>
                <td style={s.td}>{lead.company}</td>
                <td style={s.td}>${lead.budget?.toLocaleString()}</td>
                <td style={s.td}>{lead.source}</td>
                <td style={s.td}>
                  <span style={{ background: "#1e2d45", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem" }}>
                    {lead.status}
                  </span>
                </td>
                <td style={s.td}>
                  <ScoreBadge score={lead.leadScore} category={lead.leadCategory} />
                </td>
                <td style={s.td}>{lead.interactionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Lead Modal */}
      {showForm && (
        <div style={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={s.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 style={{ fontWeight: 800 }}>New Lead — AI will auto-score</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              {[["name","Name"],["email","Email"],["company","Company"]].map(([key,lbl]) => (
                <div key={key}>
                  <label style={s.label}>{lbl}</label>
                  <input style={s.formInput} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} required />
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={s.label}>Budget ($) *AI*</label>
                  <input style={s.formInput} type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} required />
                </div>
                <div>
                  <label style={s.label}>Company Size *AI*</label>
                  <select style={s.formInput} value={form.companySize} onChange={e => setForm({...form, companySize: e.target.value})}>
                    {["1-10","11-50","51-200","201-500","500+"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Interaction Count *AI*</label>
                  <input style={s.formInput} type="number" min="0" value={form.interactionCount} onChange={e => setForm({...form, interactionCount: e.target.value})} />
                </div>
                <div>
                  <label style={s.label}>Email Response Rate % *AI*</label>
                  <input style={s.formInput} type="number" min="0" max="100" value={form.emailResponseRate} onChange={e => setForm({...form, emailResponseRate: e.target.value})} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <input type="checkbox" id="prev" checked={form.previousConversion} onChange={e => setForm({...form, previousConversion: e.target.checked})} />
                <label htmlFor="prev" style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Previous Conversion (AI bonus) *AI*</label>
              </div>

              <button type="submit" style={{ ...s.btn, width: "100%", padding: "0.8rem" }}>
                Create Lead & Calculate AI Score
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
