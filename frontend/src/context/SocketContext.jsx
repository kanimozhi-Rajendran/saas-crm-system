// ─────────────────────────────────────────────────────────────
//  Socket Context — Real-time Notifications
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("crm_notifications");
    return saved ? JSON.parse(saved) : [];
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("crm_token");
      const newSocket = io(process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5000", {
        auth: { token },
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected");
      });

      newSocket.on("new_lead", (data) => {
        addNotification(data);
      });

      newSocket.on("deal_update", (data) => {
        addNotification(data);
      });

      newSocket.on("ticket_alert", (data) => {
        addNotification(data);
      });

      newSocket.on("ai_recommendation", (data) => {
        addNotification(data);
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const addNotification = (notification) => {
    setNotifications((prev) => {
      const updated = [{ ...notification, read: false, id: Date.now() }, ...prev].slice(0, 50);
      localStorage.setItem("crm_notifications", JSON.stringify(updated));
      return updated;
    });
    setUnreadCount((prev) => prev + 1);
  };

  const markAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem("crm_notifications", JSON.stringify(updated));
      return updated;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem("crm_notifications", JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem("crm_notifications");
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};
