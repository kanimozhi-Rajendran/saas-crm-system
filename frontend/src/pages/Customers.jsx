import { useState, useEffect } from "react";
import { customersAPI } from "../utils/api";
import { useTheme } from "../context/ThemeContext";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", companySize: "11-50", industry: "", status: "Prospect" });
  
  // Churn Modal state
  const [churnModal, setChurnModal] = useState({ show: false, customer: null, prediction: null, loading: false });
  const { colors } = useTheme();

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

  const handlePredictChurn = async (customer) => {
    setChurnModal({ show: true, customer, prediction: null, loading: true });
    try {
      const { data } = await customersAPI.getChurnPrediction(customer._id);
      setChurnModal(prev => ({ ...prev, prediction: data.data, loading: false }));
    } catch (err) {
      console.error(err);
      setChurnModal(prev => ({ ...prev, loading: false }));
    }
  };

  const statusColor = (s) => ({ Active: colors.green, Inactive: colors.red, Prospect: colors.amber })[s] || colors.muted;

  const s = {
    btn: { background: `linear-gradient(135deg, #4F6EF7, #7c3aed)`, border: "none", color: "#fff", padding: "0.6rem 1.2rem", borderRadius: "10px", cursor: "pointer", fontWeight: 700, transition: "all 0.2s ease" },
    table: { width: "100%", borderCollapse: "collapse", background: colors.surface, borderRadius: "12px", overflow: "hidden" },
    th: { padding: "0.9rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: colors.muted, textTransform: "uppercase", letterSpacing: "0.05em", background: "#0d1120", borderBottom: `1px solid ${colors.border}` },
    td: { padding: "1rem", borderBottom: `1px solid ${colors.border}`, fontSize: "0.85rem", color: colors.text },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
    modal: { background: colors.surface, border: `1px solid #2a3349`, borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" },
    formInput: { width: "100%", padding: "0.7rem 0.9rem", background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: "8px", color: colors.text, fontSize: "0.85rem", marginBottom: "1rem", boxSizing: "border-box" },
    label: { display: "block", fontSize: "0.75rem", color: colors.muted, marginBottom: "0.3rem", fontWeight: 600 },
    delBtn: { background: "rgba(239,68,68,0.08)", border: `1px solid rgba(239,68,68,0.3)`, color: colors.red, padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, transition: "all 0.2s ease" },
    churnBtn: { background: "rgba(0,212,255,0.08)", border: `1px solid rgba(0,212,255,0.3)`, color: "#00d4ff", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, marginRight: "0.5rem", transition: "all 0.2s ease" },
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>👥 Customers</h2>
        <button style={s.btn} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} onClick={() => setShowForm(true)}>+ New Customer</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={s.table}>
          <thead>
            <tr>{["Name","Company","Industry","Size","Status","Revenue","Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: colors.muted }}>Loading customers...</td></tr>
            ) : customers.length === 0 ? (
               <tr><td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: colors.muted }}>
                 <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📥</div>
                 No customers found.
               </td></tr>
            ) : customers.map((c) => (
              <tr key={c._id}
                onMouseEnter={e => e.currentTarget.style.background = "#111827"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                style={{ transition: "background 0.15s ease" }}
              >
                <td style={s.td}><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ color: colors.muted, fontSize: "0.75rem" }}>{c.email}</div></td>
                <td style={s.td}><div style={{ fontWeight: 600 }}>{c.company}</div></td>
                <td style={s.td}>{c.industry}</td>
                <td style={s.td}>{c.companySize}</td>
                <td style={s.td}><span style={{ background: `${statusColor(c.status)}22`, color: statusColor(c.status), padding: "0.3rem 0.8rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{c.status}</span></td>
                <td style={s.td}><div style={{ fontWeight: 700, color: colors.accent }}>${c.totalRevenue?.toLocaleString()}</div></td>
                <td style={s.td}>
                  <button style={s.churnBtn} onClick={() => handlePredictChurn(c)}>🤖 AI Churn Risk</button>
                  <button style={s.delBtn} onClick={() => handleDelete(c._id)}>Delete</button>
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
              <h3 style={{ fontWeight: 800 }}>New Customer</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: colors.muted, cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              {[["name","Name"],["email","Email"],["phone","Phone"],["company","Company"],["industry","Industry"]].map(([key,lbl]) => (
                <div key={key}><label style={s.label}>{lbl}</label><input style={s.formInput} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} required={["name","email"].includes(key)} /></div>
              ))}
              <label style={s.label}>Company Size</label>
              <select style={s.formInput} value={form.companySize} onChange={e => setForm({...form, companySize: e.target.value})}>
                {["1-10","11-50","51-200","201-500","500+"].map(s => <option key={s}>{s}</option>)}
              </select>
              <button type="submit" style={{ ...s.btn, width: "100%", padding: "0.8rem" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>Create Customer</button>
            </form>
          </div>
        </div>
      )}

      {/* Churn Prediction Modal */}
      {churnModal.show && (
        <div style={s.modalOverlay} onClick={e => e.target === e.currentTarget && setChurnModal({ show: false, customer: null, prediction: null, loading: false })}>
          <div style={s.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ fontWeight: 800 }}>AI Churn Prediction</h3>
              <button onClick={() => setChurnModal({ show: false, customer: null, prediction: null, loading: false })} style={{ background: "none", border: "none", color: colors.muted, cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            
            <p style={{ color: colors.muted, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Predicting retention risk for <strong style={{ color: colors.text }}>{churnModal.customer?.company}</strong>
            </p>

            {churnModal.loading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: colors.accent }}>Analyzing interactions & revenue patterns...</div>
            ) : churnModal.prediction ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* Risk Gauge */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "1.5rem", background: colors.bg, borderRadius: "12px", border: `1px solid ${colors.border}` }}>
                  <div style={{
                    width: "120px", height: "120px", borderRadius: "50%",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    border: `8px solid ${churnModal.prediction.riskLevel === 'High' ? colors.red : churnModal.prediction.riskLevel === 'Medium' ? colors.amber : colors.green}`
                  }}>
                    <span style={{ fontSize: "2.2rem", fontWeight: 800, color: churnModal.prediction.riskLevel === 'High' ? colors.red : churnModal.prediction.riskLevel === 'Medium' ? colors.amber : colors.green }}>
                      {churnModal.prediction.churnProbability}%
                    </span>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: churnModal.prediction.riskLevel === 'High' ? colors.red : churnModal.prediction.riskLevel === 'Medium' ? colors.amber : colors.green }}>
                      {churnModal.prediction.riskLevel} Risk
                    </div>
                  </div>
                </div>

                {/* Factors */}
                <div>
                  <h4 style={{ fontSize: "0.9rem", color: colors.muted, marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Key Factors</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {churnModal.prediction.factors.map((factor, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                        <span style={{ color: colors.accent }}>→</span>
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Actions */}
                <div>
                  <h4 style={{ fontSize: "0.9rem", color: colors.muted, marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recommended Actions</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {churnModal.prediction.suggestedActions.map((action, i) => (
                      <div key={i} style={{ 
                        background: "rgba(16, 185, 129, 0.1)", borderLeft: `3px solid ${colors.green}`,
                        padding: "0.8rem", borderRadius: "4px", fontSize: "0.85rem"
                      }}>
                        {action}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ color: colors.red }}>Failed to generate prediction.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
