// ─────────────────────────────────────────────────────────────
//  CRM Copilot — AI Chatbot Assistant
// ─────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const CRMCopilot = () => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm your CRM Copilot. Ask me about leads, deals, revenue, tickets, or recommendations!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("crm_token");
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/chatbot/message`,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botMessage = {
        role: "bot",
        text: data.response.reply,
        data: data.response.data,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: "bot",
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    { label: "Show Leads", query: "show me leads" },
    { label: "Revenue", query: "what's the revenue" },
    { label: "Recommendations", query: "give me recommendations" },
  ];

  const s = {
    fab: {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`,
      border: "none",
      color: "#fff",
      fontSize: "1.5rem",
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      zIndex: 999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    panel: {
      position: "fixed",
      bottom: "90px",
      right: "24px",
      width: "380px",
      height: "500px",
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: "16px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      zIndex: 998,
      display: isOpen ? "flex" : "none",
      flexDirection: "column",
      overflow: "hidden",
    },
    header: {
      padding: "1rem 1.25rem",
      background: `linear-gradient(135deg, ${colors.accent}, ${colors.purple})`,
      color: "#fff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    messages: {
      flex: 1,
      overflowY: "auto",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
    },
    bubble: (role) => ({
      maxWidth: "75%",
      padding: "0.75rem 1rem",
      borderRadius: "12px",
      fontSize: "0.85rem",
      lineHeight: 1.5,
      alignSelf: role === "user" ? "flex-end" : "flex-start",
      background: role === "user" ? colors.purple : colors.border,
      color: role === "user" ? "#fff" : colors.text,
    }),
    inputArea: {
      padding: "1rem",
      borderTop: `1px solid ${colors.border}`,
      display: "flex",
      gap: "0.5rem",
    },
    input: {
      flex: 1,
      padding: "0.75rem",
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: "8px",
      color: colors.text,
      fontSize: "0.85rem",
    },
    sendBtn: {
      padding: "0.75rem 1rem",
      background: colors.accent,
      border: "none",
      borderRadius: "8px",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
    },
    quickActions: {
      padding: "0.5rem 1rem",
      display: "flex",
      gap: "0.5rem",
      flexWrap: "wrap",
      borderTop: `1px solid ${colors.border}`,
    },
    quickBtn: {
      padding: "0.4rem 0.8rem",
      background: colors.border,
      border: "none",
      borderRadius: "999px",
      color: colors.text,
      fontSize: "0.75rem",
      cursor: "pointer",
    },
  };

  return (
    <>
      <button style={s.fab} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "🤖"}
      </button>

      <div style={s.panel}>
        <div style={s.header}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>CRM Copilot</h3>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}
          >
            ✕
          </button>
        </div>

        <div style={s.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={s.bubble(msg.role)}>
              <p style={{ margin: 0 }}>{msg.text}</p>
              {msg.data && Array.isArray(msg.data) && msg.data.length > 0 && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", opacity: 0.9 }}>
                  {msg.data.slice(0, 3).map((item, j) => (
                    <div key={j} style={{ marginTop: "0.25rem" }}>
                      • {item.name || item.title || item.command || JSON.stringify(item).slice(0, 50)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div style={s.bubble("bot")}>
              <span style={{ animation: "pulse 1.5s infinite" }}>●</span>
              <span style={{ animation: "pulse 1.5s infinite 0.2s" }}>●</span>
              <span style={{ animation: "pulse 1.5s infinite 0.4s" }}>●</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={s.quickActions}>
          {quickActions.map((action, i) => (
            <button key={i} style={s.quickBtn} onClick={() => sendMessage(action.query)}>
              {action.label}
            </button>
          ))}
        </div>

        <div style={s.inputArea}>
          <input
            style={s.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask me anything..."
          />
          <button style={s.sendBtn} onClick={() => sendMessage(input)}>
            ➤
          </button>
        </div>
      </div>
    </>
  );
};

export default CRMCopilot;
