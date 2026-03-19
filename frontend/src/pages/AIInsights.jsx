import { useState, useEffect } from "react";
import { analyticsAPI, exportAPI } from "../utils/api";
import { useTheme } from "../context/ThemeContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    analyticsAPI.getAIInsights()
      .then(({ data }) => setInsights(data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await exportAPI.exportAnalyticsPDF();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'analytics-report.pdf');
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div style={{ color: colors.accent, padding: "2rem" }}>Loading AI Insights...</div>;
  if (!insights) return <div style={{ color: colors.text, padding: "2rem" }}>No insights data available.</div>;

  const { growth, topPerformer, pipelineHealthScore, industryBreakdown, forecast, riskAlerts } = insights;
  const cardStyle = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1.5rem" };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>🧠 AI Insights & Forecasting</h2>
        <button 
          onClick={handleExport} 
          disabled={exporting}
          style={{ 
            background: colors.purple, color: "#fff", border: "none", 
            padding: "0.5rem 1rem", borderRadius: "8px", cursor: exporting ? "not-allowed" : "pointer" 
          }}>
          {exporting ? "Generating PDF..." : "📥 Download Report"}
        </button>
      </div>

      {/* Growth Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {Object.entries(growth).map(([key, data]) => (
          <div key={key} style={cardStyle}>
            <p style={{ fontSize: "0.8rem", color: colors.muted, textTransform: "capitalize", fontWeight: 600 }}>{key} Growth</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", margin: "0.5rem 0" }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                {key === 'revenue' ? `$${(data.value/1000).toFixed(1)}k` : data.value}
              </span>
              <span style={{ color: data.growth >= 0 ? colors.green : colors.red, fontSize: "0.9rem", fontWeight: 600 }}>
                {data.growth >= 0 ? '↑' : '↓'} {Math.abs(data.growth)}%
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: colors.muted }}>
              vs Last Month ({key === 'revenue' ? `$${(data.lastMonth/1000).toFixed(1)}k` : data.lastMonth})
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Pipeline Health */}
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", alignSelf: "flex-start" }}>Pipeline Health Score</h3>
          <div style={{
            width: "120px", height: "120px", borderRadius: "50%", 
            border: `8px solid ${pipelineHealthScore > 70 ? colors.green : pipelineHealthScore > 40 ? colors.amber : colors.red}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", fontWeight: 800
          }}>
            {pipelineHealthScore}
          </div>
          <p style={{ marginTop: "1rem", color: colors.muted, fontSize: "0.85rem", textAlign: "center" }}>
            Based on conversion rate, average deal size, and ticket resolution time.
          </p>
        </div>

        {/* Revenue Forecast & Top Performer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ ...cardStyle, background: `linear-gradient(135deg, ${colors.surface}, rgba(0, 212, 255, 0.05))` }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>AI Revenue Forecast</h3>
            <p style={{ fontSize: "0.8rem", color: colors.muted, marginBottom: "0.5rem" }}>Projected for Next Month</p>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: colors.accent, marginBottom: "0.5rem" }}>
              ${(forecast.nextMonthRevenue).toLocaleString()}
            </div>
            <p style={{ fontSize: "0.8rem", color: colors.muted }}>Model Confidence: <span style={{ color: forecast.confidence === 'High' ? colors.green : colors.amber }}>{forecast.confidence}</span></p>
          </div>

          <div style={{ ...cardStyle, background: `linear-gradient(135deg, ${colors.surface}, rgba(124, 58, 237, 0.05))` }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Top Performer Spotlight</h3>
            {topPerformer ? (
              <div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: colors.purple }}>{topPerformer.name}</div>
                <div style={{ fontSize: "0.9rem", color: colors.text, marginTop: "0.25rem" }}>{topPerformer.deals} Deals Won • ${(topPerformer.revenue/1000).toFixed(1)}k Revenue</div>
              </div>
            ) : (
              <p style={{ color: colors.muted }}>Not enough Closed Won data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Industry Breakdown */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Industry Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={industryBreakdown} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
              <XAxis type="number" stroke={colors.muted} fontSize={10} tickFormatter={v => `$${v/1000}k`} />
              <YAxis dataKey="_id" type="category" stroke={colors.muted} fontSize={10} />
              <Tooltip contentStyle={{ background: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }} formatter={v => [`$${v.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" name="Revenue ($)" fill={colors.accent} radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Alerts */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: colors.red }}>High Churn Risks</h3>
          {riskAlerts && riskAlerts.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", maxHeight: "220px", overflowY: "auto", paddingRight: "0.5rem" }}>
              {riskAlerts.map(risk => (
                <div key={risk._id} style={{ padding: "0.8rem", background: "rgba(239, 68, 68, 0.05)", borderLeft: `3px solid ${colors.red}`, borderRadius: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{risk.name}</span>
                    <span style={{ color: colors.red, fontWeight: 700, fontSize: "0.9rem" }}>{Math.round(risk.churnProbability)}% Risk</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: colors.muted }}>{risk.company}</span>
                    <span style={{ fontSize: "0.8rem", color: colors.muted, background: colors.bg, padding: "0.1rem 0.4rem", borderRadius: "4px" }}>{risk.riskLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <p style={{ color: colors.muted }}>No high risk customers detected. Great job!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
