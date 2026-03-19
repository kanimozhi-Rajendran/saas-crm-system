import { useState, useEffect } from "react";
import { analyticsAPI, activityAPI } from "../utils/api";
import { useTheme } from "../context/ThemeContext";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const StatCard = ({ label, value, sub, color, icon, colors, percent }) => (
  <div style={{
    background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "12px",
    padding: "1.5rem", position: "relative", overflow: "hidden",
    transition: "border-color 0.2s ease"
  }}
  onMouseEnter={e => e.currentTarget.style.border = `1px solid ${color}`}
  onMouseLeave={e => e.currentTarget.style.border = `1px solid ${colors.border}`}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: color }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ color: colors.muted, fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{label}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: colors.text, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
          <span style={{
            fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "4px",
            background: percent.startsWith("-") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
            color: percent.startsWith("-") ? "#ef4444" : "#10b981",
          }}>
            {percent}
          </span>
        </div>
        {sub && <p style={{ color: colors.muted, fontSize: "0.8rem", marginTop: "0.3rem" }}>{sub}</p>}
      </div>
      <div style={{
        fontSize: "1.4rem", width: "40px", height: "40px", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `${color}22`, color: color, flexShrink: 0
      }}>{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  const pieColors = ["#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, recsRes, actRes] = await Promise.all([
          analyticsAPI.getDashboard(),
          analyticsAPI.getRecommendations(),
          activityAPI.getRecent(),
        ]);
        setMetrics(metricsRes.data.data);
        setRecommendations(recsRes.data.data);
        setActivities(actRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ color: colors.accent, padding: "2rem" }}>Loading dashboard...</div>;

  const { overview, charts } = metrics || {};
  const pieData = [
    { name: "High", value: charts?.leadsByCategory?.High || 0 },
    { name: "Medium", value: charts?.leadsByCategory?.Medium || 0 },
    { name: "Low", value: charts?.leadsByCategory?.Low || 0 },
  ];

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard colors={colors} label="Total Revenue" value={`$${(overview?.totalRevenue || 0).toLocaleString()}`} icon="💰" color="#4F6EF7" sub={`${overview?.closedWonDeals || 0} closed deals`} percent="+12%" />
        <StatCard colors={colors} label="Active Deals" value={overview?.activeDeals || 0} icon="💼" color="#7c3aed" percent="+8%" />
        <StatCard colors={colors} label="Total Leads" value={overview?.totalLeads || 0} icon="🎯" color="#00d4ff" sub={`${overview?.leadConversionRate || 0}% conversion`} percent="+15%" />
        <StatCard colors={colors} label="Customers" value={overview?.totalCustomers || 0} icon="👥" color="#10b981" sub={`+${overview?.newCustomersThisMonth || 0} this month`} percent="+5%" />
        <StatCard colors={colors} label="Open Tickets" value={overview?.openTickets || 0} icon="🎫" color="#f59e0b" sub={`Avg ${overview?.avgResolutionTimeHours || 0}h`} percent="-2%" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Monthly Revenue Chart */}
        <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 700 }}>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={charts?.monthlyRevenue || []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "8px" }} itemStyle={{ color: "#e2e8f0" }} labelStyle={{ color: "#e2e8f0" }} formatter={v => [`$${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#00d4ff" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Category Pie */}
        <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 700 }}>AI Lead Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "8px" }} itemStyle={{ color: "#e2e8f0" }} labelStyle={{ color: "#e2e8f0" }} />
              <Legend formatter={v => <span style={{ color: colors.muted, fontSize: "0.8rem" }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        
        {/* Deal Pipeline Bar Chart */}
        <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 700 }}>Deal Pipeline by Stage</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts?.dealsByStage || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="stage" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "8px" }} itemStyle={{ color: "#e2e8f0" }} labelStyle={{ color: "#e2e8f0" }} />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Recommendations */}
        <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 700 }}>🤖 AI Recommendations</h3>
          {recommendations.length === 0 ? (
            <p style={{ color: colors.muted, fontSize: "0.9rem" }}>No recommendations at this time.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "220px", overflowY: "auto" }}>
              {recommendations.slice(0, 6).map((rec, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: colors.bg, borderRadius: "8px", padding: "0.9rem 1rem",
                  borderLeft: `3px solid ${rec.priority === "High" ? colors.red : rec.priority === "Medium" ? colors.amber : colors.green}`,
                }}>
                  <span style={{ fontSize: "0.85rem" }}>{rec.icon} {rec.message}</span>
                  <span style={{
                    fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: "999px", fontWeight: 700,
                    background: rec.priority === "High" ? "rgba(239,68,68,0.1)" : rec.priority === "Medium" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                    color: rec.priority === "High" ? colors.red : rec.priority === "Medium" ? colors.amber : colors.green,
                  }}>
                    {rec.action}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 700 }}>⚡ Recent Activity Feed</h3>
        {activities.length === 0 ? (
          <p style={{ color: colors.muted, fontSize: "0.9rem" }}>No recent activity to show.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "300px", overflowY: "auto", paddingRight: "0.5rem" }}>
            {activities.map(act => (
              <div key={act._id} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", paddingBottom: "1rem", borderBottom: `1px solid ${colors.border}55` }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: `linear-gradient(135deg, ${colors.bg}, ${colors.surface})`,
                  border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0
                }}>
                  {act.action === "Created" ? "✨" : act.action === "Updated" ? "✏️" : act.action === "Deleted" ? "🗑️" : "🔔"}
                </div>
                <div>
                  <p style={{ fontSize: "0.95rem", color: colors.text }}>
                    <strong style={{ color: colors.accent }}>{act.performedBy?.name || "System"}</strong> {act.action.toLowerCase()} {act.entityType.toLowerCase()}: <strong>{act.description}</strong>
                  </p>
                  <p style={{ fontSize: "0.75rem", color: colors.muted, marginTop: "0.3rem" }}>
                    {new Date(act.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
