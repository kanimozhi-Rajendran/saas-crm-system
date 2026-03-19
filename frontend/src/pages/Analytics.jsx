import { useState, useEffect } from "react";
import { analyticsAPI } from "../utils/api";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const Analytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(({ data }) => setMetrics(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "#00d4ff", padding: "2rem" }}>Loading analytics...</div>;

  const { overview, charts } = metrics || {};

  const radarData = [
    { metric: "Conversion", value: overview?.leadConversionRate || 0 },
    { metric: "Resolution", value: Math.min(100 - (overview?.avgResolutionTimeHours || 0), 100) },
    { metric: "Deals Won", value: overview?.closedWonDeals * 10 || 0 },
    { metric: "Active Deals", value: overview?.activeDeals * 5 || 0 },
    { metric: "Customers", value: Math.min(overview?.totalCustomers * 2, 100) || 0 },
  ];

  const cardStyle = { background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "12px", padding: "1.5rem" };

  return (
    <div style={{ color: "#e2e8f0" }}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1.5rem" }}>CRM Analytics</h2>

      {/* KPI Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Lead Conversion", value: `${overview?.leadConversionRate || 0}%`, color: "#10b981" },
          { label: "Avg Resolution", value: `${overview?.avgResolutionTimeHours || 0}h`, color: "#f59e0b" },
          { label: "Total Revenue", value: `$${((overview?.totalRevenue || 0) / 1000).toFixed(1)}k`, color: "#00d4ff" },
          { label: "Active Deals", value: overview?.activeDeals || 0, color: "#7c3aed" },
          { label: "Open Tickets", value: overview?.openTickets || 0, color: "#ef4444" },
        ].map((kpi, i) => (
          <div key={i} style={{ ...cardStyle, borderTop: `3px solid ${kpi.color}` }}>
            <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, marginBottom: "0.5rem" }}>{kpi.label}</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 800, color: kpi.color, fontFamily: "'JetBrains Mono', monospace" }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Revenue Trend */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 700 }}>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={charts?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "8px" }} itemStyle={{ color: "#e2e8f0" }} labelStyle={{ color: "#e2e8f0" }} formatter={v => [`$${v.toLocaleString()}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#00d4ff" strokeWidth={2} dot={{ fill: "#00d4ff", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* CRM Health Radar */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 700 }}>CRM Health Radar</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e2d45" />
              <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={11} />
              <PolarRadiusAxis stroke="#1e2d45" fontSize={9} />
              <Radar name="CRM" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
              <Tooltip contentStyle={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "8px" }} itemStyle={{ color: "#e2e8f0" }} labelStyle={{ color: "#e2e8f0" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deal Pipeline Value */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 700 }}>Pipeline Value by Stage</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={charts?.dealsByStage || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey="stage" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: "8px" }} itemStyle={{ color: "#e2e8f0" }} labelStyle={{ color: "#e2e8f0" }} formatter={v => [`$${v.toLocaleString()}`, "Pipeline Value"]} />
            <Legend />
            <Bar dataKey="value" name="Value ($)" fill="#10b981" radius={[4,4,0,0]} />
            <Bar dataKey="count" name="Count" fill="#00d4ff" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;