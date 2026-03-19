// ─────────────────────────────────────────────────────────────
//  App.jsx — Router
// ─────────────────────────────────────────────────────────────
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Leads from "./pages/Leads";
import Deals from "./pages/Deals";
import Tickets from "./pages/Tickets";
import Analytics from "./pages/Analytics";
import AIInsights from "./pages/AIInsights";
import AdminPanel from "./pages/AdminPanel";
import Pipeline from "./pages/Pipeline";

const App = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Protected */}
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai-insights" element={<AIInsights />} />
        <Route path="/pipeline" element={<Pipeline />} />
      </Route>
    </Route>

    {/* Admin Only */}
    <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
      <Route element={<Layout />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
);

export default App;
