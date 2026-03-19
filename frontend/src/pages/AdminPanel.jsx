import { useState, useEffect } from "react";
import { adminAPI } from "../utils/api";
import { useTheme } from "../context/ThemeContext";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    adminAPI.getUsers()
      .then(({ data }) => setUsers(data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await adminAPI.updateUser(id, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user role", err);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      if (isActive) {
        await adminAPI.deleteUser(id); 
      } else {
        await adminAPI.updateUser(id, { isActive: true });
      }
      fetchUsers();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  if (loading) return <div style={{ color: colors.accent, padding: "2rem" }}>Loading User Data...</div>;

  const cardStyle = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "1.5rem" };
  const thStyle = { padding: "1rem", textAlign: "left", color: colors.muted, fontSize: "0.85rem", fontWeight: 600, borderBottom: `1px solid ${colors.border}` };
  const tdStyle = { padding: "1rem", borderBottom: `1px solid ${colors.border}`, fontSize: "0.9rem" };

  return (
    <div style={{ color: colors.text }}>
      <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1.5rem" }}>⚙️ Admin Panel</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {['Admin', 'Sales', 'Support'].map(role => (
          <div key={role} style={{...cardStyle, borderTop: `3px solid ${role === 'Admin' ? colors.red : role === 'Sales' ? colors.green : colors.purple}`}}>
            <p style={{ fontSize: "0.8rem", color: colors.muted, fontWeight: 600 }}>{role} Users</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 800 }}>{users.filter(u => u.role === role).length}</p>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>User Management</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Last Login</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.8rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                      }}>
                        {u.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>
                    <select 
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, padding: "0.4rem", borderRadius: "6px", outline: "none", cursor: "pointer" }}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Sales">Sales</option>
                      <option value="Support">Support</option>
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ 
                      background: u.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", 
                      color: u.isActive ? colors.green : colors.red, 
                      padding: "0.3rem 0.8rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600
                    }}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: colors.muted }}>
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}
                  </td>
                  <td style={tdStyle}>
                    <button 
                      onClick={() => handleToggleActive(u._id, u.isActive)}
                      style={{ 
                        background: u.isActive ? "rgba(239, 68, 68, 0.05)" : "rgba(16, 185, 129, 0.05)",
                        color: u.isActive ? colors.red : colors.green,
                        border: `1px solid ${u.isActive ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                        padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600
                      }}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
