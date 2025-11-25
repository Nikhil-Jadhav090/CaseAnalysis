// API Configuration
// In production, set VITE_API_URL environment variable in Vercel
// to your backend URL (e.g., https://your-backend.onrender.com)
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  // Auth
  login: `${API_URL}/api/auth/login/`,
  register: `${API_URL}/api/auth/register/`,
  tokenRefresh: `${API_URL}/api/auth/token/refresh/`,
  profile: `${API_URL}/api/auth/profile/`,
  
  // Cases
  cases: `${API_URL}/api/cases/`,
  caseDetail: (id) => `${API_URL}/api/cases/${id}/`,
  analyzeCase: (id) => `${API_URL}/api/cases/${id}/analyze/`,
  uploadDocument: (id) => `${API_URL}/api/cases/${id}/upload_document/`,
  addComment: (id) => `${API_URL}/api/cases/${id}/add_comment/`,
  closeCase: (id) => `${API_URL}/api/cases/${id}/close/`,
  approveCase: (id) => `${API_URL}/api/cases/${id}/approve/`,
  
  // Admin
  users: `${API_URL}/api/auth/manage/users/`,
  userDetail: (id) => `${API_URL}/api/auth/manage/users/${id}/`,
  activityLogs: `${API_URL}/api/auth/admin/activity-logs/`,
  
  // Chat
  chatSessions: `${API_URL}/api/chat/sessions/`,
  chatMessages: (id) => `${API_URL}/api/chat/sessions/${id}/messages/`,
};

export default API_URL;
