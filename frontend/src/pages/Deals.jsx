// ─────────────────────────────────────────────────────────────
//  Deals Page — AI Deal Success Prediction
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { dealsAPI } from "../utils/api";

const ProbabilityBar = ({ probability, status }) => {
  const color = probability >= 75 ? "#10b981" : probability >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{status}</span>
        <span style={{ fontWeight: 700, color, fontSize: "0.85rem" }}>{probability}%</span>
      </div>
      <div style={{ height: "6px", background: "#1e2d45", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${probability}%`, height: "100%", background: color, borderRadius: "3px", transition: "width 0.5s" }} />
      </div>
    </div>
  );
};

const STAGES = ["Prospecting","Qualification","Proposal","Negotiation","Closed Won","Closed Lost"];

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [form, setForm] = useState({
    title: "", value: "", stage: "Prospecting", leadScore: 50,
    daysInPipeline: 0, competitorCount: 0, stakeholderCount: 1,
    hasBudgetConfirmed: false, hasChampion: false, notes: "",
  });

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const { data } = await dealsAPI.getAll();
      setDeals(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDeals(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await dealsAPI.create(form);
      setAiResult(data.ai);
      fetchDeals();
      setShowForm(false);
    } catch (err) { alert(err.response?.data?.message || "Error creating deal"); }
  };

  const stageColor = (stage) => {
    const map = { "Prospecting": "#64748b", "Qualification": "#00d4ff", "Proposal": "#7c3aed", "Negotiation": "#f59e0b", "Closed Won": "#10b981", "Closed Lost": "#ef4444" };
    return map[stage] || "#64748b";
  };

  const s = {
    btn: { background: "linear-gradient(135deg, #00d4ff, #7c3aed)", border: "none", color: "#fff", padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontWeight: 700 },
    table: { width: "100%", borderCollapse: "collapse", background: "#0d1526", borderRadius: "12px", overflow: "hidden" },
    th: { padding: "0.9rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", background: "#111827", borderBottom: "1px solid #1e2d45" },
    td: { padding: "1rem", borderBottom: "1px solid #1e2d4530", fontSize: "0.85rem", color: "#e2e8f0" },
    input: { padding: "0.6rem 0.9rem", background: "#111827", border: "1px solid #1e2d45", borderRadius: "8px", color: "#e2e8f0", fontSize: "0.85rem" },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
    modal: { background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "540px", maxHeight: "90vh", overflowY: "auto" },
    formInput: { width: "100%", padding: "0.7rem 0.9rem", background: "#111827", border: "1px solid #1e2d45", borderRadius: "8px", color: "#e2e8f0", fontSize: "0.85rem", marginBottom: "1rem", boxSizing: "border-box" },
    label: { display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.3rem", fontWeight: 600 },
  };

  return (
    <div style={{ color: "#e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.2rem" }}>Deal Predictions</h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>AI predicts your deal close probability in real-time</p>
        </div>
        <button style={s.btn} onClick={() => setShowForm(true)}>+ New Deal</button>
      </div>

      {aiResult && (
        <div style={{ background: "#0d1526", border: "1px solid #7c3aed", borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "0.5rem" }}>🤖 AI Prediction: {aiResult.probability}% — {aiResult.status}</div>
          {aiResult.insights?.map((ins, i) => <div key={i} style={{ color: "#64748b", fontSize: "0.8rem" }}>• {ins}</div>)}
          <button onClick={() => setAiResult(null)} style={{ marginTop: "0.5rem", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.8rem" }}>Dismiss</button>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Title","Value","Stage","AI Probability","Budget Confirmed","Champion"].map(h => <th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading...</td></tr>
            ) : deals.map((deal) => (
              <tr key={deal._id}>
                <td style={s.td}><div style={{ fontWeight: 600 }}>{deal.title}</div></td>
                <td style={s.td}>${deal.value?.toLocaleString()}</td>
                <td style={s.td}>
                  <span style={{ background: `${stageColor(deal.stage)}22`, color: stageColor(deal.stage), padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700 }}>
                    {deal.stage}
                  </span>
                </td>
                <td style={{ ...s.td, minWidth: "180px" }}>
                  <ProbabilityBar probability={deal.dealProbability} status={deal.dealPredictionStatus} />
                </td>
                <td style={s.td}>{deal.hasBudgetConfirmed ? "✅" : "❌"}</td>
                <td style={s.td}>{deal.hasChampion ? "✅" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={s.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 style={{ fontWeight: 800 }}>New Deal — AI will predict probability</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <label style={s.label}>Deal Title</label>
              <input style={s.formInput} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Enterprise License Deal" />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={s.label}>Deal Value ($)</label>
                  <input style={s.formInput} type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} required />
                </div>
                <div>
                  <label style={s.label}>Stage *AI*</label>
                  <select style={s.formInput} value={form.stage} onChange={e => setForm({...form, stage: e.target.value})}>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Lead Score (0-100) *AI*</label>
                  <input style={s.formInput} type="number" min="0" max="100" value={form.leadScore} onChange={e => setForm({...form, leadScore: e.target.value})} />
                </div>
                <div>
                  <label style={s.label}>Days in Pipeline *AI*</label>
                  <input style={s.formInput} type="number" min="0" value={form.daysInPipeline} onChange={e => setForm({...form, daysInPipeline: e.target.value})} />
                </div>
                <div>
                  <label style={s.label}>Competitor Count *AI*</label>
                  <input style={s.formInput} type="number" min="0" value={form.competitorCount} onChange={e => setForm({...form, competitorCount: e.target.value})} />
                </div>
                <div>
                  <label style={s.label}>Stakeholder Count *AI*</label>
                  <input style={s.formInput} type="number" min="1" value={form.stakeholderCount} onChange={e => setForm({...form, stakeholderCount: e.target.value})} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.hasBudgetConfirmed} onChange={e => setForm({...form, hasBudgetConfirmed: e.target.checked})} />
                  Budget Confirmed *AI*
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.hasChampion} onChange={e => setForm({...form, hasChampion: e.target.checked})} />
                  Has Champion *AI*
                </label>
              </div>

              <button type="submit" style={{ ...s.btn, width: "100%", padding: "0.8rem" }}>
                Create Deal & Predict Probability
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;