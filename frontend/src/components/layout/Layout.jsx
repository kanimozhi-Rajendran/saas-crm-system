import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CRMCopilot from "../chatbot/CRMCopilot";
import { useTheme } from "../../context/ThemeContext";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { colors } = useTheme();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bg }}>
      <Sidebar collapsed={collapsed} />
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginLeft: collapsed ? "70px" : "240px",
        transition: "margin 0.3s"
      }}>
        <Navbar onToggle={() => setCollapsed(!collapsed)} />
        <main style={{ flex: 1, padding: "2rem", overflowY: "auto", position: "relative" }}>
          <Outlet />
          <CRMCopilot />
        </main>
      </div>
    </div>
  );
};

export default Layout;