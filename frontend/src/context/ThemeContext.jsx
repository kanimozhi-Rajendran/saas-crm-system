// ─────────────────────────────────────────────────────────────
//  Theme Context — Dark/Light Mode Toggle
// ─────────────────────────────────────────────────────────────
import { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const themes = {
  dark: {
    bg: "#0a0e1a",
    surface: "#0d1526",
    border: "#1e2d45",
    text: "#e2e8f0",
    muted: "#64748b",
    accent: "#00d4ff",
    purple: "#7c3aed",
    green: "#10b981",
    amber: "#f59e0b",
    red: "#ef4444",
  },
  light: {
    bg: "#f1f5f9",
    surface: "#ffffff",
    border: "#e2e8f0",
    text: "#0f172a",
    muted: "#64748b",
    accent: "#0ea5e9",
    purple: "#7c3aed",
    green: "#10b981",
    amber: "#f59e0b",
    red: "#ef4444",
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("crm_theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("crm_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const colors = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      <div style={{ background: colors.bg, minHeight: "100vh", color: colors.text }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
