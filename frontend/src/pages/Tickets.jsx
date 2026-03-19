import { useState, useEffect } from "react";
import { ticketsAPI } from "../utils/api";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    category: "General",
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await ticketsAPI.getAll();
      setTickets(data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    console.log("CREATE CALLED",form);
    try {
      await ticketsAPI.create(form);
      await fetchTickets();
      setShowForm(false);
      setForm({ title: "", description: "", priority: "Medium", category: "General" });
    } catch (err) {
      console.error("Create error:", err);
      const msg = err?.response?.data?.message || err?.message || "Error creating ticket";
      window.alert(msg);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await ticketsAPI.update(id, { status });
      await fetchTickets();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const priorityColor = (p) =>
    ({ Low: "#10b981", Medium: "#f59e0b", High: "#ef4444", Critical: "#dc2626" }[p] || "#64748b");

  const statusColor = (st) =>
    ({ Open: "#ef4444", "In Progress": "#f59e0b", Resolved: "#10b981", Closed: "#64748b" }[st] || "#64748b");

  const styles = {
    btn: {
      background: "linear-gradient(135deg, #4F6EF7, #7c3aed)",
      border: "none", color: "#fff", padding: "0.6rem 1.2rem",
      borderRadius: "10px", cursor: "pointer", fontWeight: 700,
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
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    },
    modal: {
      background: "#0d1526", border: "1px solid #2a3349",
      borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "480px",
      maxHeight: "90vh", overflowY: "auto",
    },
    formInput: {
      width: "100%", padding: "0.7rem 0.9rem",
      background: "#111827", border: "1px solid #1e2d45",
      borderRadius: "8px", color: "#e2e8f0",
      fontSize: "0.85rem", marginBottom: "1rem", boxSizing: "border-box",
    },
    label: {
      display: "block", fontSize: "0.75rem",
      color: "#94a3b8", marginBottom: "0.3rem", fontWeight: 600,
    },
    selectSmall: {
      width: "100%", padding: "0.3rem 0.6rem",
      background: "#111827", border: "1px solid #1e2d45",
      borderRadius: "6px", color: "#e2e8f0", fontSize: "0.75rem",
    },
  };

  const PRIORITIES = ["Low", "Medium", "High", "Critical"];
  const CATEGORIES = ["Technical", "Billing", "Feature Request", "General", "Bug"];
  const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

  return (
    <div style={{ color: "#e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.2rem" }}>Support Tickets</h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Track and resolve customer issues</p>
        </div>
        <button style={styles.btn} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} onClick={() => setShowForm(true)}>+ New Ticket</button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["Title", "Category", "Priority", "Status", "Resolution Time", "Update Status"].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📥</div>
                  No tickets yet. Click "+ New Ticket" to create one!
                </td>
              </tr>
            ) : tickets.map((ticket) => (
              <tr
                key={ticket._id}
                onMouseEnter={e => e.currentTarget.style.background = "#111827"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                style={{ transition: "background 0.15s ease" }}
              >
                <td style={styles.td}>
                  <div style={{ fontWeight: 600 }}>{ticket.title}</div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                    {ticket.description?.substring(0, 40)}
                  </div>
                </td>
                <td style={styles.td}>{ticket.category}</td>
                <td style={styles.td}>
                  <span style={{
                    background: `${priorityColor(ticket.priority)}22`,
                    color: priorityColor(ticket.priority),
                    padding: "0.2rem 0.6rem", borderRadius: "6px",
                    fontSize: "0.75rem", fontWeight: 700,
                  }}>
                    {ticket.priority}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    background: `${statusColor(ticket.status)}22`,
                    color: statusColor(ticket.status),
                    padding: "0.2rem 0.6rem", borderRadius: "6px",
                    fontSize: "0.75rem", fontWeight: 700,
                  }}>
                    {ticket.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {ticket.resolutionTimeHours != null ? `${ticket.resolutionTimeHours}h` : "—"}
                </td>
                <td style={styles.td}>
                  <select
                    value={ticket.status}
                    onChange={e => handleStatusUpdate(ticket._id, e.target.value)}
                    style={styles.selectSmall}
                  >
                    {STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={styles.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 style={{ fontWeight: 800, color: "#e2e8f0" }}>New Ticket</h3>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <label style={styles.label}>Title *</label>
              <input
                style={styles.formInput}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Payment button not working"
              />
              <label style={styles.label}>Description *</label>
              <textarea
                style={{ ...styles.formInput, height: "100px", resize: "vertical" }}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                placeholder="Describe the issue..."
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={styles.label}>Priority</label>
                  <select
                    style={styles.formInput}
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.formInput}
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <hr style={{ border: 0, borderTop: "1px solid #1e2d45", margin: "1.5rem 0" }} />
              <button type="submit" style={{ ...styles.btn, width: "100%", padding: "0.8rem" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                Create Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;