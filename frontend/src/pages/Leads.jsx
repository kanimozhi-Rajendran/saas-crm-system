// ─────────────────────────────────────────────────────────────
//  Leads Page — AI Lead Scoring Interface with Edit & Delete
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { leadsAPI } from "../utils/api";

const ScoreBadge = ({ score, category }) => {
  const colors = { High: "#10b981", Medium: "#f59e0b", Low: "#ef4444" };
  const color = colors[category] || "#64748b";
  const glow = category === "High" ? "0 0 8px rgba(16,185,129,0.5)" : category === "Medium" ? "0 0 8px rgba(245,158,11,0.4)" : "none";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ width: "60px", height: "8px", background: "#1e2d45", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.5s", boxShadow: glow }} />
      </div>
      <span style={{ fontWeight: 700, color, fontSize: "0.85rem" }}>{score}</span>
      <span style={{ background: `${color}22`, color, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>{category}</span>
    </div>
  );
};

const EMPTY_FORM = {
  name: "", email: "", company: "", budget: "",
  companySize: "11-50", interactionCount: 0,
  emailResponseRate: 0, previousConversion: false,
  source: "Website", status: "New", notes: "",
};

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [filter, setFilter] = useState({ category: "", status: "" });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [aiResult, setAiResult] = useState(null);

  // ── Fetch Leads ──────────────────────────────────────────────
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await leadsAPI.getAll(filter);
      setLeads(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [filter]);

  // ── Create ───────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await leadsAPI.create(form);
      setAiResult(data.ai);
      fetchLeads();
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating lead");
    }
  };

  // ── Open Edit Modal ──────────────────────────────────────────
  const handleEditClick = (lead) => {
    setEditingLead(lead);
    setEditForm({
      name: lead.name || "",
      email: lead.email || "",
      company: lead.company || "",
      budget: lead.budget || "",
      companySize: lead.companySize || "11-50",
      interactionCount: lead.interactionCount || 0,
      emailResponseRate: lead.emailResponseRate || 0,
      previousConversion: lead.previousConversion || false,
      source: lead.source || "Website",
      status: lead.status || "New",
      notes: lead.notes || "",
    });
    setShowEditForm(true);
  };

  // ── Save Edit ────────────────────────────────────────────────
  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await leadsAPI.update(editingLead._id, editForm);
      setAiResult(data.ai || null);
      fetchLeads();
      setShowEditForm(false);
      setEditingLead(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating lead");
    }
  };

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead? This cannot be undone.")) return;
    try {
      await leadsAPI.delete(id);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting lead");
    }
  };

  // ── Styles ───────────────────────────────────────────────────
  const s = {
    btn: {
      background: "linear-gradient(135deg, #4F6EF7, #7c3aed)",
      border: "none", color: "#fff", padding: "0.6rem 1.2rem",
      borderRadius: "10px", cursor: "pointer", fontWeight: 700,
      transition: "all 0.2s ease",
    },
    editBtn: {
      background: "rgba(0,212,255,0.08)",
      border: "1px solid rgba(0,212,255,0.3)",
      color: "#00d4ff", padding: "0.3rem 0.7rem",
      borderRadius: "6px", cursor: "pointer",
      fontSize: "0.75rem", marginRight: "0.4rem",
      transition: "all 0.2s ease",
    },
    deleteBtn: {
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.3)",
      color: "#f87171", padding: "0.3rem 0.7rem",
      borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem",
      transition: "all 0.2s ease",
    },
    table: {
      width: "100%", borderCollapse: "collapse",
      background: "#0d1526", borderRadius: "12px", overflow: "hidden",
    },
    th: {
      padding: "0.9rem 1rem", textAlign: "left",
      fontSize: "0.75rem", fontWeight: 700, color: "#64748b",
      textTransform: "uppercase", letterSpacing: "0.05em",
      background: "#0d1120", borderBottom: "1px solid #1e2d45",
    },
    td: {
      padding: "1rem", borderBottom: "1px solid #1e2d4530",
      fontSize: "0.85rem", color: "#e2e8f0",
    },
    input: {
      padding: "0.6rem 0.9rem", background: "#111827",
      border: "1px solid #1e2d45", borderRadius: "8px",
      color: "#e2e8f0", fontSize: "0.85rem",
    },
    modalOverlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 200,
    },
    modal: {
      background: "#0d1526", border: "1px solid #2a3349",
      borderRadius: "16px", padding: "2rem",
      width: "100%", maxWidth: "540px",
      maxHeight: "90vh", overflowY: "auto",
    },
    formInput: {
      width: "100%", padding: "0.7rem 0.9rem",
      background: "#111827", border: "1px solid #1e2d45",
      borderRadius: "8px", color: "#e2e8f0",
      fontSize: "0.85rem", marginBottom: "1rem",
      boxSizing: "border-box",
    },
    label: {
      display: "block", fontSize: "0.75rem",
      color: "#94a3b8", marginBottom: "0.3rem", fontWeight: 600,
    },
  };

  // ── Reusable Form Fields ─────────────────────────────────────
  const FormFields = ({ formData, setFormData }) => (
    <>
      <label style={s.label}>Name *</label>
      <input
        style={s.formInput}
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        required
        placeholder="John Smith"
      />

      <label style={s.label}>Email *</label>
      <input
        style={s.formInput}
        type="email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        required
        placeholder="john@company.com"
      />

      <label style={s.label}>Company</label>
      <input
        style={s.formInput}
        value={formData.company}
        onChange={e => setFormData({ ...formData, company: e.target.value })}
        placeholder="ABC Corp"
      />

      <hr style={{ border: 0, borderTop: "1px solid #1e2d45", margin: "1.5rem 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label style={s.label}>Budget ($) *AI*</label>
          <input
            style={s.formInput}
            type="number"
            value={formData.budget}
            onChange={e => setFormData({ ...formData, budget: e.target.value })}
            required
            placeholder="50000"
          />
        </div>
        <div>
          <label style={s.label}>Company Size *AI*</label>
          <select
            style={s.formInput}
            value={formData.companySize}
            onChange={e => setFormData({ ...formData, companySize: e.target.value })}
          >
            {["1-10","11-50","51-200","201-500","500+"].map(sz => (
              <option key={sz}>{sz}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={s.label}>Interaction Count *AI*</label>
          <input
            style={s.formInput}
            type="number"
            min="0"
            value={formData.interactionCount}
            onChange={e => setFormData({ ...formData, interactionCount: e.target.value })}
          />
        </div>

        <div>
          <label style={s.label}>Email Response Rate % *AI*</label>
          <input
            style={s.formInput}
            type="number"
            min="0"
            max="100"
            value={formData.emailResponseRate}
            onChange={e => setFormData({ ...formData, emailResponseRate: e.target.value })}
          />
        </div>

        <div>
          <label style={s.label}>Source</label>
          <select
            style={s.formInput}
            value={formData.source}
            onChange={e => setFormData({ ...formData, source: e.target.value })}
          >
            {["Website","Referral","Cold Call","Social Media","Event","Other"].map(src => (
              <option key={src}>{src}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={s.label}>Status</label>
          <select
            style={s.formInput}
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
          >
            {["New","Contacted","Qualified","Proposal","Converted","Lost"].map(st => (
              <option key={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.75rem 0 1rem" }}>
        <input
          type="checkbox"
          id="prevConv"
          checked={formData.previousConversion}
          onChange={e => setFormData({ ...formData, previousConversion: e.target.checked })}
        />
        <label htmlFor="prevConv" style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
          Previous Conversion (AI +10 bonus)
        </label>
      </div>

      <label style={s.label}>Notes</label>
      <textarea
        style={{ ...s.formInput, height: "70px", resize: "vertical" }}
        value={formData.notes}
        onChange={e => setFormData({ ...formData, notes: e.target.value })}
        placeholder="Any notes about this lead..."
      />
    </>
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={{ color: "#e2e8f0" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.2rem" }}>AI Lead Scoring</h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Leads are automatically scored using AI (0-100)</p>
        </div>
        <button style={s.btn} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} onClick={() => setShowForm(true)}>+ New Lead</button>
      </div>

      {/* AI Result Toast */}
      {aiResult && (
        <div style={{
          background: "#0d1526", border: "1px solid #10b981",
          borderRadius: "12px", padding: "1rem 1.5rem",
          marginBottom: "1.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ color: "#34d399", fontWeight: 700, marginBottom: "0.4rem" }}>
              🤖 AI Score: {aiResult.score} — Category: {aiResult.category}
            </div>
            {aiResult.breakdown && (
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {Object.entries(aiResult.breakdown).map(([key, val]) => (
                  <span key={key} style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    {key}: <strong style={{ color: "#94a3b8" }}>{val}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setAiResult(null)}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <select style={s.input} value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
          <option value="">All Categories</option>
          <option value="High">High (71-100)</option>
          <option value="Medium">Medium (41-70)</option>
          <option value="Low">Low (0-40)</option>
        </select>
        <select style={s.input} value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Statuses</option>
          {["New","Contacted","Qualified","Proposal","Converted","Lost"].map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Name","Company","Budget","Source","Status","AI Score","Interactions","Actions"].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📥</div>
                  No leads found. Click "+ New Lead" to create one!
                </td>
              </tr>
            ) : leads.map((lead) => (
              <tr
                key={lead._id}
                onMouseEnter={e => e.currentTarget.style.background = "#111827"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                style={{ transition: "background 0.15s ease" }}
              >
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{lead.name}</div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{lead.email}</div>
                </td>
                <td style={s.td}>{lead.company || "—"}</td>
                <td style={s.td}>${lead.budget?.toLocaleString()}</td>
                <td style={s.td}>{lead.source}</td>
                <td style={s.td}>
                  <span style={{
                    background: "#1e2d45", padding: "0.2rem 0.6rem",
                    borderRadius: "6px", fontSize: "0.75rem",
                    color: lead.status === "Converted" ? "#10b981" :
                           lead.status === "Lost" ? "#ef4444" : "#e2e8f0",
                  }}>
                    {lead.status}
                  </span>
                </td>
                <td style={s.td}>
                  <ScoreBadge score={lead.leadScore} category={lead.leadCategory} />
                </td>
                <td style={s.td}>{lead.interactionCount}</td>
                <td style={s.td}>
                  <button style={s.editBtn} onClick={() => handleEditClick(lead)}>
                    ✏️ Edit
                  </button>
                  <button style={s.deleteBtn} onClick={() => handleDelete(lead._id)}>
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Create Modal ─────────────────────────────────────── */}
      {showForm && (
        <div style={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={s.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 style={{ fontWeight: 800, color: "#e2e8f0" }}>New Lead — AI will auto-score</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <FormFields formData={form} setFormData={setForm} />
              <button type="submit" style={{ ...s.btn, width: "100%", padding: "0.8rem" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                Create Lead & Calculate AI Score
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ───────────────────────────────────────── */}
      {showEditForm && editingLead && (
        <div style={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowEditForm(false)}>
          <div style={s.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontWeight: 800, color: "#e2e8f0" }}>Edit Lead</h3>
                <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                  AI score will recalculate automatically on save
                </p>
              </div>
              <button onClick={() => setShowEditForm(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>

            {/* Current Score */}
            <div style={{
              background: "#111827", borderRadius: "8px",
              padding: "0.75rem 1rem", marginBottom: "1.2rem",
              display: "flex", alignItems: "center", gap: "1rem",
            }}>
              <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Current Score:</span>
              <ScoreBadge score={editingLead.leadScore} category={editingLead.leadCategory} />
            </div>

            <form onSubmit={handleEditSave}>
              <FormFields formData={editForm} setFormData={setEditForm} />
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  style={{
                    flex: 1, padding: "0.8rem",
                    background: "none", border: "1px solid #1e2d45",
                    color: "#64748b", borderRadius: "10px", cursor: "pointer",
                    fontWeight: 600, transition: "all 0.2s ease"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  Cancel
                </button>
                <button type="submit" style={{ ...s.btn, flex: 2, padding: "0.8rem" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  Save & Recalculate AI Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Leads;
