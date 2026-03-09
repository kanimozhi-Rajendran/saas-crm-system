// ═══════════════════════════════════════════════════════════════
//  ENHANCED Dashboard — Complete CRM Analytics & Activities
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { analyticsAPI } from "../utils/api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from "recharts";

// ═══════════════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
const StatCard = ({ label, value, sub, color = "#00d4ff", icon, trend }) => (
  <div style={{
    background: "#0d1526",
    border: "1px solid #1e2d45",
    borderRadius: "12px",
    padding: "1.5rem",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-4px)";
    e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.3)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "none";
  }}
  >
    <div style={{ 
      position: "absolute", 
      top: 0, 
      left: 0, 
      right: 0, 
      height: "3px", 
      background: color 
    }} />
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "flex-start" 
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ 
          color: "#64748b", 
          fontSize: "0.75rem", 
          fontWeight: 600, 
          textTransform: "uppercase", 
          letterSpacing: "0.05em", 
          marginBottom: "0.5rem" 
        }}>
          {label}
        </p>
        <p style={{ 
          fontSize: "2rem", 
          fontWeight: 800, 
          color: "#e2e8f0",
          marginBottom: "0.25rem",
        }}>
          {value}
        </p>
        {sub && (
          <p style={{ 
            color: "#64748b", 
            fontSize: "0.8rem", 
            marginTop: "0.3rem" 
          }}>
            {sub}
          </p>
        )}
        {trend !== undefined && (
          <div style={{ 
            marginTop: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}>
            <span style={{ 
              color: trend >= 0 ? "#10b981" : "#ef4444",
              fontSize: "0.85rem",
              fontWeight: 700,
            }}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
            <span style={{ 
              color: "#64748b", 
              fontSize: "0.75rem" 
            }}>
              vs last month
            </span>
          </div>
        )}
      </div>
      <div style={{ fontSize: "1.8rem" }}>{icon}</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// ACTIVITY ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════
const ActivityItem = ({ activity }) => {
  const getActivityColor = (action) => {
    switch (action) {
      case "created": return "#10b981";
      case "updated": return "#00d4ff";
      case "deleted": return "#ef4444";
      case "status_changed": return "#f59e0b";
      case "assigned": return "#7c3aed";
      case "converted": return "#10b981";
      default: return "#64748b";
    }
  };

  const getActivityIcon = (entityType) => {
    switch (entityType) {
      case "Lead": return "🎯";
      case "Deal": return "💼";
      case "Customer": return "👤";
      case "Ticket": return "🎫";
      case "User": return "⚙️";
      default: return "📝";
    }
  };

  return (
    <div style={{
      display: "flex",
      gap: "1rem",
      padding: "0.75rem 0",
      borderBottom: "1px solid #1e2d45",
    }}>
      <div style={{
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: getActivityColor(activity.action),
        marginTop: "0.5rem",
        flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem",
          marginBottom: "0.25rem",
        }}>
          <span style={{ fontSize: "1rem" }}>
            {getActivityIcon(activity.entityType)}
          </span>
          <span style={{ 
            color: "#e2e8f0", 
            fontSize: "0.85rem",
            fontWeight: 600,
          }}>
            {activity.description}
          </span>
        </div>
        <div style={{ 
          display: "flex", 
          gap: "0.75rem",
          fontSize: "0.75rem",
          color: "#64748b",
        }}>
          <span>by {activity.performedBy}</span>
          <span>•</span>
          <span>{activity.timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════
const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsRes, recsRes] = await Promise.all([
          analyticsAPI.getDashboard(),
          analyticsAPI.getRecommendations(),
        ]);
        setMetrics(metricsRes.data.data);
        setRecommendations(recsRes.data.data);
        setError(null);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        height: "60vh",
        color: "#00d4ff",
        fontSize: "1.2rem",
      }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: "2rem",
        color: "#ef4444",
        textAlign: "center",
      }}>
        {error}
      </div>
    );
  }

  const { overview, charts, recentActivities } = metrics || {};

  const COLORS = ["#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"];

  const pieData = [
    { name: "High", value: charts?.leadsByCategory?.High || 0 },
    { name: "Medium", value: charts?.leadsByCategory?.Medium || 0 },
    { name: "Low", value: charts?.leadsByCategory?.Low || 0 },
  ];

  return (
    <div style={{ padding: "0.5rem 0" }}>
      {/* ═══════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ 
          fontSize: "1.8rem", 
          fontWeight: 800, 
          color: "#e2e8f0",
          marginBottom: "0.5rem",
        }}>
          Dashboard Analytics
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          Real-time CRM metrics and AI-powered insights
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* KPI CARDS - ROW 1: CORE METRICS */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2rem" 
      }}>
        <StatCard 
          label="Total Revenue" 
          value={`$${(overview?.totalRevenue || 0).toLocaleString()}`}
          icon="💰" 
          color="#10b981" 
          sub={`${overview?.closedWonDeals || 0} closed deals`}
        />
        <StatCard 
          label="Total Leads" 
          value={overview?.totalLeads || 0}
          icon="🎯" 
          color="#7c3aed" 
          sub={`${overview?.leadConversionRate || 0}% conversion rate`}
          trend={overview?.leadGrowthRate}
        />
        <StatCard 
          label="Total Customers" 
          value={overview?.totalCustomers || 0}
          icon="👥" 
          color="#f59e0b" 
          sub={`+${overview?.newCustomersThisMonth || 0} this month`}
          trend={overview?.customerGrowthRate}
        />
        <StatCard 
          label="Active Deals" 
          value={overview?.activeDeals || 0}
          icon="💼" 
          color="#00d4ff"
          sub={`${overview?.dealWinRate || 0}% win rate`}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* KPI CARDS - ROW 2: FINANCIAL & TICKETS */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2rem" 
      }}>
        <StatCard 
          label="Total Deal Value" 
          value={`$${(overview?.totalDealValue || 0).toLocaleString()}`}
          icon="💎" 
          color="#7c3aed"
          sub="All deals combined"
        />
        <StatCard 
          label="Avg Deal Value" 
          value={`$${(overview?.averageDealValue || 0).toLocaleString()}`}
          icon="📊" 
          color="#00d4ff"
          sub="Per deal average"
        />
        <StatCard 
          label="Pipeline Value" 
          value={`$${(overview?.totalPipelineValue || 0).toLocaleString()}`}
          icon="🔄" 
          color="#10b981"
          sub="Active deals value"
        />
        <StatCard 
          label="Open Tickets" 
          value={overview?.openTickets || 0}
          icon="🎫" 
          color="#ef4444" 
          sub={`${overview?.ticketResolutionRate || 0}% resolved`}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* CHARTS SECTION */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "2fr 1fr", 
        gap: "1.5rem", 
        marginBottom: "2rem" 
      }}>
        {/* Monthly Revenue Chart */}
        <div style={{ 
          background: "#0d1526", 
          border: "1px solid #1e2d45", 
          borderRadius: "12px", 
          padding: "1.5rem" 
        }}>
          <h3 style={{ 
            color: "#e2e8f0", 
            marginBottom: "1rem", 
            fontSize: "0.95rem", 
            fontWeight: 700 
          }}>
            📈 Monthly Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={charts?.monthlyRevenue || []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                fontSize={11} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`} 
              />
              <Tooltip 
                contentStyle={{ 
                  background: "#0d1526", 
                  border: "1px solid #1e2d45", 
                  borderRadius: "8px", 
                  color: "#e2e8f0" 
                }} 
                formatter={v => [`$${v.toLocaleString()}`, "Revenue"]} 
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#00d4ff" 
                strokeWidth={2} 
                fill="url(#revGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Category Pie */}
        <div style={{ 
          background: "#0d1526", 
          border: "1px solid #1e2d45", 
          borderRadius: "12px", 
          padding: "1.5rem" 
        }}>
          <h3 style={{ 
            color: "#e2e8f0", 
            marginBottom: "1rem", 
            fontSize: "0.95rem", 
            fontWeight: 700 
          }}>
            🎯 AI Lead Categories
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={pieData} 
                cx="50%" 
                cy="50%" 
                innerRadius={60} 
                outerRadius={90} 
                paddingAngle={3} 
                dataKey="value"
              >
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: "#0d1526", 
                  border: "1px solid #1e2d45", 
                  color: "#e2e8f0" 
                }} 
              />
              <Legend 
                formatter={v => (
                  <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                    {v}
                  </span>
                )} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deal Pipeline Bar Chart */}
      <div style={{ 
        background: "#0d1526", 
        border: "1px solid #1e2d45", 
        borderRadius: "12px", 
        padding: "1.5rem", 
        marginBottom: "2rem" 
      }}>
        <h3 style={{ 
          color: "#e2e8f0", 
          marginBottom: "1rem", 
          fontSize: "0.95rem", 
          fontWeight: 700 
        }}>
          💼 Deal Pipeline by Stage
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={charts?.dealsByStage || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey="stage" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip 
              contentStyle={{ 
                background: "#0d1526", 
                border: "1px solid #1e2d45", 
                color: "#e2e8f0" 
              }} 
            />
            <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* RECENT ACTIVITIES & RECOMMENDATIONS */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "1.5rem",
        marginBottom: "2rem",
      }}>
        {/* Recent Activities */}
        <div style={{ 
          background: "#0d1526", 
          border: "1px solid #1e2d45", 
          borderRadius: "12px", 
          padding: "1.5rem" 
        }}>
          <h3 style={{ 
            color: "#e2e8f0", 
            marginBottom: "1rem", 
            fontSize: "0.95rem", 
            fontWeight: 700 
          }}>
            📝 Recent Activities
          </h3>
          {!recentActivities || recentActivities.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              No recent activities
            </p>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div style={{ 
          background: "#0d1526", 
          border: "1px solid #1e2d45", 
          borderRadius: "12px", 
          padding: "1.5rem" 
        }}>
          <h3 style={{ 
            color: "#e2e8f0", 
            marginBottom: "1rem", 
            fontSize: "0.95rem", 
            fontWeight: 700 
          }}>
            🤖 AI Recommendations
          </h3>
          {recommendations.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              No recommendations at this time
            </p>
          ) : (
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "0.75rem",
              maxHeight: "400px",
              overflowY: "auto",
            }}>
              {recommendations.slice(0, 8).map((rec, i) => (
                <div 
                  key={i} 
                  style={{
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    background: "#111827", 
                    borderRadius: "8px", 
                    padding: "0.9rem 1rem",
                    borderLeft: `3px solid ${
                      rec.priority === "High" 
                        ? "#ef4444" 
                        : rec.priority === "Medium" 
                        ? "#f59e0b" 
                        : "#10b981"
                    }`,
                  }}
                >
                  <span style={{ 
                    color: "#e2e8f0", 
                    fontSize: "0.85rem",
                    flex: 1,
                  }}>
                    {rec.icon} {rec.message}
                  </span>
                  <span style={{
                    fontSize: "0.7rem", 
                    padding: "0.2rem 0.6rem", 
                    borderRadius: "999px", 
                    fontWeight: 700,
                    background: rec.priority === "High" 
                      ? "rgba(239,68,68,0.15)" 
                      : rec.priority === "Medium" 
                      ? "rgba(245,158,11,0.15)" 
                      : "rgba(16,185,129,0.15)",
                    color: rec.priority === "High" 
                      ? "#f87171" 
                      : rec.priority === "Medium" 
                      ? "#fbbf24" 
                      : "#34d399",
                    whiteSpace: "nowrap",
                    marginLeft: "0.5rem",
                  }}>
                    {rec.action}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
