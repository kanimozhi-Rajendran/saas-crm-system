// ─────────────────────────────────────────────────────────────
//  Notification Bell — Real-time Alerts Dropdown
// ─────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { useTheme } from "../../context/ThemeContext";
import { FiBell } from "react-icons/fi";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationColor = (notification) => {
    if (notification.priority === "critical" || notification.type === "ticket_alert") return colors.red;
    if (notification.type === "deal_update") return colors.amber;
    if (notification.type === "new_lead") return colors.green;
    return colors.accent;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const s = {
    container: { position: "relative" },
    bell: {
      position: "relative",
      background: "none",
      border: "none",
      color: colors.text,
      fontSize: "1.3rem",
      cursor: "pointer",
      padding: "0.5rem",
      borderRadius: "8px",
      transition: "background 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    badge: {
      position: "absolute",
      top: "0px",
      right: "0px",
      background: colors.red,
      color: "#fff",
      fontSize: "0.65rem",
      fontWeight: 700,
      padding: "0.15rem 0.4rem",
      borderRadius: "999px",
      minWidth: "18px",
      textAlign: "center",
    },
    dropdown: {
      position: "absolute",
      top: "calc(100% + 8px)",
      right: 0,
      width: "380px",
      maxHeight: "320px",
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: "12px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      zIndex: 1000,
      overflow: "hidden",
      display: isOpen ? "flex" : "none",
      flexDirection: "column",
    },
    header: {
      padding: "1rem 1.25rem",
      borderBottom: `1px solid ${colors.border}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    list: {
      overflowY: "auto",
      flex: 1,
    },
    item: {
      padding: "1rem 1.25rem",
      borderBottom: `1px solid ${colors.border}`,
      cursor: "pointer",
      transition: "background 0.2s",
    },
    clearBtn: {
      background: "none",
      border: "none",
      color: colors.accent,
      fontSize: "0.8rem",
      cursor: "pointer",
      fontWeight: 600,
    },
  };

  return (
    <div style={s.container} ref={dropdownRef}>
      <button
        style={s.bell}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => (e.currentTarget.style.background = colors.border)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <FiBell />
        {unreadCount > 0 && <span style={s.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      <div style={s.dropdown}>
        <div style={s.header}>
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>Notifications</h3>
          {notifications.length > 0 && (
            <button style={s.clearBtn} onClick={markAllAsRead}>
              Mark all read
            </button>
          )}
        </div>

        <div style={s.list}>
          {notifications.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: colors.muted }}>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>No notifications yet</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notif) => (
              <div
                key={notif.id}
                style={{
                  ...s.item,
                  background: notif.read ? "transparent" : `${colors.accent}10`,
                  borderLeft: `3px solid ${getNotificationColor(notif)}`,
                }}
                onClick={() => markAsRead(notif.id)}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.border)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = notif.read ? "transparent" : `${colors.accent}10`)
                }
              >
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: 600 }}>
                  {notif.message}
                </p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: colors.muted }}>
                  {formatTime(notif.timestamp)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
