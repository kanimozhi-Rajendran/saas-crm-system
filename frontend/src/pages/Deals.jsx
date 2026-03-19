// ─────────────────────────────────────────────────────────────
//  Deals Page — AI Deal Success Prediction with Edit & Delete
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { dealsAPI } from "../utils/api";

const ProbabilityBar = ({ probability, status }) => {
  const color = probability >= 75 ? "#10b981" : probability >= 50 ? "#f59e0b" : "#ef4444";
  const glow = probability >= 75 ? "0 0 8px rgba(16,185,129,0.5)" : probability >= 50 ? "0 0 8px rgba(245,158,11,0.4)" : "none";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{status}</span>
        <span style={{ fontWeight: 700, color, fontSize: "0.85rem" }}>{probability}%</span>
      </div>
      <div style={{ height: "8px", background: "#1e2d45", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${probability}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.5s", boxShadow: glow }} />
      </div>
    </div>
  );
};

const STAGES = ["Prospecting","Qualification","Proposal","Negotiation","Closed Won","Closed Lost"];

const EMPTY_FORM = {
  title: "", value: "", stage: "Prospecting", leadScore: 50,
  daysInPipeline: 0, competitorCount: 0, stakeholderCount: 1,
  hasBudgetConfirmed: false, hasChampion: false, notes: "",
};

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  // ── Fetch Deals ──────────────────────────────────────────────
  const fetchDeals = async () => {
    setLoading(true);
    try {
      const { data } = await dealsAPI.getAll();
      setDeals(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeals(); }, []);

  // ── Create ───────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await dealsAPI.create(form);
      setAiResult(data.ai);
      fetchDeals();
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating deal");
    }
  };

  // ── Open Edit Modal ──────────────────────────────────────────
  const handleEditClick = (deal) => {
    setEditingDeal(deal);
    setEditForm({
      title: deal.title || "",
      value: deal.value || "",
      stage: deal.stage || "Prospecting",
      leadScore: deal.leadScore || 50,
      daysInPipeline: deal.daysInPipeline || 0,
      competitorCount: deal.competitorCount || 0,
      stakeholderCount: deal.stakeholderCount || 1,
      hasBudgetConfirmed: deal.hasBudgetConfirmed || false,
      hasChampion: deal.hasChampion || false,
      notes: deal.notes || "",
    });
    setShowEditForm(true);
  };

  // ── Save Edit ────────────────────────────────────────────────
  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await dealsAPI.update(editingDeal._id, editForm);
      setAiResult(data.ai || null);
      fetchDeals();
      setShowEditForm(false);
      setEditingDeal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating deal");
    }
  };

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this deal? This cannot be undone.")) return;
    try {
      await dealsAPI.delete(id);
      fetchDeals();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting deal");
    }
  };

  // ── Stage Color ──────────────────────────────────────────────
  const stageColor = (stage) => {
    const map = {
      "Prospecting": "#64748b",
      "Qualification": "#00d4ff",
      "Proposal": "#7c3aed",
      "Negotiation": "#f59e0b",
      "Closed Won": "#10b981",
      "Closed Lost": "#ef4444",
    };
    return map[stage] || "#64748b";
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
      <label style={s.label}>Deal Title *</label>
      <input
        style={s.formInput}
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
        required
        placeholder="Enterprise License Deal"
      />

      <hr style={{ border: 0, borderTop: "1px solid #1e2d45", margin: "1.5rem 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label style={s.label}>Deal Value ($) *</label>
          <input
            style={s.formInput}
            type="number"
            value={formData.value}
            onChange={e => setFormData({ ...formData, value: e.target.value })}
            required
            placeholder="50000"
          />
        </div>
        <div>
          <label style={s.label}>Stage *AI*</label>
          <select
            style={s.formInput}
            value={formData.stage}
            onChange={e => setFormData({ ...formData, stage: e.target.value })}
          >
            {STAGES.map(st => <option key={st}>{st}</option>)}
          </select>
        </div>

        <div>
          <label style={s.label}>Lead Score (0-100) *AI*</label>
          <input
            style={s.formInput}
            type="number"
            min="0" max="100"
            value={formData.leadScore}
            onChange={e => setFormData({ ...formData, leadScore: e.target.value })}
          />
        </div>
        <div>
          <label style={s.label}>Days in Pipeline *AI*</label>
          <input
            style={s.formInput}
            type="number"
            min="0"
            value={formData.daysInPipeline}
            onChange={e => setFormData({ ...formData, daysInPipeline: e.target.value })}
          />
        </div>

        <div>
          <label style={s.label}>Competitor Count *AI*</label>
          <input
            style={s.formInput}
            type="number"
            min="0"
            value={formData.competitorCount}
            onChange={e => setFormData({ ...formData, competitorCount: e.target.value })}
          />
        </div>
        <div>
          <label style={s.label}>Stakeholder Count *AI*</label>
          <input
            style={s.formInput}
            type="number"
            min="1"
            value={formData.stakeholderCount}
            onChange={e => setFormData({ ...formData, stakeholderCount: e.target.value })}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", margin: "0.5rem 0 1rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={formData.hasBudgetConfirmed}
            onChange={e => setFormData({ ...formData, hasBudgetConfirmed: e.target.checked })}
          />
          Budget Confirmed *AI*
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={formData.hasChampion}
            onChange={e => setFormData({ ...formData, hasChampion: e.target.checked })}
          />
          Has Champion *AI*
        </label>
      </div>

      <label style={s.label}>Notes</label>
      <textarea
        style={{ ...s.formInput, height: "70px", resize: "vertical" }}
        value={formData.notes}
        onChange={e => setFormData({ ...formData, notes: e.target.value })}
        placeholder="Any notes about this deal..."
      />
    </>
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={{ color: "#e2e8f0" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.2rem" }}>Deal Predictions</h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>AI predicts your deal close probability in real-time</p>
        </div>
        <button style={s.btn} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} onClick={() => setShowForm(true)}>+ New Deal</button>
      </div>

      {/* AI Result Toast */}
      {aiResult && (
        <div style={{
          background: "#0d1526", border: "1px solid #7c3aed",
          borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "1.5rem",
        }}>
          <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "0.5rem" }}>
            🤖 AI Prediction: {aiResult.probability}% — {aiResult.status}
          </div>
          {aiResult.insights?.map((ins, i) => (
            <div key={i} style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
              • {ins}
            </div>
          ))}
          <button
            onClick={() => setAiResult(null)}
            style={{ marginTop: "0.5rem", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.8rem" }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Title","Value","Stage","AI Probability","Budget","Champion","Actions"].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  Loading deals...
                </td>
              </tr>
            ) : deals.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📥</div>
                  No deals yet. Click "+ New Deal" to create one!
                </td>
              </tr>
            ) : deals.map((deal) => (
              <tr
                key={deal._id}
                onMouseEnter={e => e.currentTarget.style.background = "#111827"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                style={{ transition: "background 0.15s ease" }}
              >
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{deal.title}</div>
                  {deal.notes && (
                    <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                      {deal.notes.substring(0, 40)}...
                    </div>
                  )}
                </td>
                <td style={s.td}>${deal.value?.toLocaleString()}</td>
                <td style={s.td}>
                  <span style={{
                    background: `${stageColor(deal.stage)}22`,
                    color: stageColor(deal.stage),
                    padding: "0.2rem 0.6rem",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}>
                    {deal.stage}
                  </span>
                </td>
                <td style={{ ...s.td, minWidth: "180px" }}>
                  <ProbabilityBar
                    probability={deal.dealProbability}
                    status={deal.dealPredictionStatus}
                  />
                </td>
                <td style={s.td}>{deal.hasBudgetConfirmed ? "✅" : "❌"}</td>
                <td style={s.td}>{deal.hasChampion ? "✅" : "❌"}</td>
                <td style={s.td}>
                  <button style={s.editBtn} onClick={() => handleEditClick(deal)}>
                    ✏️ Edit
                  </button>
                  <button style={s.deleteBtn} onClick={() => handleDelete(deal._id)}>
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
              <h3 style={{ fontWeight: 800, color: "#e2e8f0" }}>New Deal — AI will predict probability</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <FormFields formData={form} setFormData={setForm} />
              <button type="submit" style={{ ...s.btn, width: "100%", padding: "0.8rem" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                Create Deal & Predict Probability
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ───────────────────────────────────────── */}
      {showEditForm && editingDeal && (
        <div style={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowEditForm(false)}>
          <div style={s.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontWeight: 800, color: "#e2e8f0" }}>Edit Deal</h3>
                <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                  AI probability will recalculate on save
                </p>
              </div>
              <button onClick={() => setShowEditForm(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>

            {/* Current Probability */}
            <div style={{
              background: "#111827", borderRadius: "8px",
              padding: "0.75rem 1rem", marginBottom: "1.2rem",
            }}>
              <div style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                Current AI Probability:
              </div>
              <ProbabilityBar
                probability={editingDeal.dealProbability}
                status={editingDeal.dealPredictionStatus}
              />
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
                  Save & Recalculate Probability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Deals;
