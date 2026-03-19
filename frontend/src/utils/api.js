// ─────────────────────────────────────────────────────────────
//  Axios API Instance — centralized config
// ─────────────────────────────────────────────────────────────
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// ── Request Interceptor — attach JWT ──────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("crm_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — handle 401 ────────────────────────
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("crm_token");
      localStorage.removeItem("crm_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
};

// ── Customers ─────────────────────────────────────────────────
export const customersAPI = {
  getAll: (params) => API.get("/customers", { params }),
  getById: (id) => API.get(`/customers/${id}`),
  create: (data) => API.post("/customers", data),
  update: (id, data) => API.put(`/customers/${id}`, data),
  delete: (id) => API.delete(`/customers/${id}`),
  getChurnPrediction: (id) => API.get(`/customers/${id}/churn-prediction`),
};

// ── Leads ─────────────────────────────────────────────────────
export const leadsAPI = {
  getAll: (params) => API.get("/leads", { params }),
  getById: (id) => API.get(`/leads/${id}`),
  create: (data) => API.post("/leads", data),
  update: (id, data) => API.put(`/leads/${id}`, data),
  delete: (id) => API.delete(`/leads/${id}`),
};

// ── Deals ─────────────────────────────────────────────────────
export const dealsAPI = {
  getAll: (params) => API.get("/deals", { params }),
  getById: (id) => API.get(`/deals/${id}`),
  create: (data) => API.post("/deals", data),
  update: (id, data) => API.put(`/deals/${id}`, data),
  delete: (id) => API.delete(`/deals/${id}`),
};

// ── Tickets ───────────────────────────────────────────────────
export const ticketsAPI = {
  getAll: (params) => API.get("/tickets", { params }),
  getById: (id) => API.get(`/tickets/${id}`),
  create: (data) => API.post("/tickets", data),
  update: (id, data) => API.put(`/tickets/${id}`, data),
  addComment: (id, data) => API.post(`/tickets/${id}/comments`, data),
};

// ── Analytics ─────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => API.get("/analytics/dashboard"),
  getRecommendations: () => API.get("/analytics/recommendations"),
  getAIInsights: () => API.get("/analytics/ai-insights"),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminAPI = {
  getUsers: () => API.get("/admin/users"),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

// ── Export ────────────────────────────────────────────────────
export const exportAPI = {
  exportLeadsCSV: () => API.get("/export/leads/csv", { responseType: 'blob' }),
  exportDealsCSV: () => API.get("/export/deals/csv", { responseType: 'blob' }),
  exportAnalyticsPDF: () => API.get("/export/analytics/pdf", { responseType: 'blob' }),
};

// ── Activity ──────────────────────────────────────────────────
export const activityAPI = {
  getRecent: () => API.get("/activity/recent"),
};

export default API;