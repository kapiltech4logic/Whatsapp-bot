/**
 * API Service Layer for UniServe Backend Integration
 * Provides centralized HTTP client for all API requests
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Authentication API Endpoints
 */
export const authAPI = {
  // Login
  login(email, password) {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  // Get current user
  getCurrentUser() {
    return fetchAPI('/auth/me');
  },
  
  // Change password
  changePassword(currentPassword, newPassword) {
    return fetchAPI('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  
  // Verify token
  verifyToken() {
    return fetchAPI('/auth/verify');
  },
};

/**
 * Organization API Endpoints
 */
export const organizationAPI = {
  // Get all organizations
  getAll() {
    return fetchAPI('/organizations');
  },
  
  // Get organization by ID
  getById(id) {
    return fetchAPI(`/organizations/${id}`);
  },
  
  // Create organization
  create(data) {
    return fetchAPI('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update organization
  update(id, data) {
    return fetchAPI(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete organization
  delete(id) {
    return fetchAPI(`/organizations/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Get organization stats
  getStats(id) {
    return fetchAPI(`/organizations/${id}/stats`);
  },
};

/**
 * Project API Endpoints
 */
export const projectAPI = {
  // Get all projects (with optional query params)
  getAll(queryString = '') {
    return fetchAPI(`/projects${queryString}`);
  },
  
  // Get project by ID
  getById(id) {
    return fetchAPI(`/projects/${id}`);
  },
  
  // Create project
  create(data) {
    return fetchAPI('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update project
  update(id, data) {
    return fetchAPI(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete project
  delete(id) {
    return fetchAPI(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Get users for a project
  getUsers(id) {
    return fetchAPI(`/projects/${id}/users`);
  },
};

/**
 * User API Endpoints
 */
export const userAPI = {
  // Get all users with optional filters
  getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/users${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get user by ID
  getById(userId) {
    return fetchAPI(`/users/${userId}`);
  },
  
  // Get user by phone number
  getByPhone(phoneNumber) {
    return fetchAPI(`/users/phone/${encodeURIComponent(phoneNumber)}`);
  },
  
  // Get user statistics
  getStats() {
    return fetchAPI('/users/stats/overview');
  },
  
  // Get active users
  getActive() {
    return fetchAPI('/users/active');
  },
  
  // Update user
  update(userId, data) {
    return fetchAPI(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete user
  delete(userId) {
    return fetchAPI(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Session API Endpoints
 */
export const sessionAPI = {
  // Get all sessions with optional filters
  getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/sessions${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get session by ID
  getById(sessionId) {
    return fetchAPI(`/sessions/${sessionId}`);
  },
  
  // Get sessions by user ID
  getByUser(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/sessions/user/${userId}${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get active sessions
  getActive() {
    return fetchAPI('/sessions/active');
  },
  
  // Get session statistics
  getStats() {
    return fetchAPI('/sessions/stats/overview');
  },
  
  // Get sessions by date range
  getByDateRange(startDate, endDate) {
    return fetchAPI(`/sessions/date-range?startDate=${startDate}&endDate=${endDate}`);
  },
  
  // Get sessions by source
  getBySource(source) {
    return fetchAPI(`/sessions/source/${source}`);
  },
  
  // Get sessions by channel
  getByChannel(channel) {
    return fetchAPI(`/sessions/channel/${channel}`);
  },
  
  // Create session
  create(data) {
    return fetchAPI('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update session
  update(sessionId, data) {
    return fetchAPI(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // End session
  end(sessionId) {
    return fetchAPI(`/sessions/${sessionId}/end`, {
      method: 'POST',
    });
  },
};

/**
 * Session Flow API Endpoints
 */
export const sessionFlowAPI = {
  // Get flows by session ID
  getBySession(sessionId) {
    return fetchAPI(`/sessions/${sessionId}/flows`);
  },
  
  // Get flow by ID
  getById(flowId) {
    return fetchAPI(`/session-flows/${flowId}`);
  },
  
  // Create flow step
  create(data) {
    return fetchAPI('/session-flows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Chat Message API Endpoints
 */
export const chatMessageAPI = {
  // Get messages by session ID
  getBySession(sessionId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/sessions/${sessionId}/messages${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get message by ID
  getById(messageId) {
    return fetchAPI(`/chat-messages/${messageId}`);
  },
  
  // Create message
  create(data) {
    return fetchAPI('/chat-messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Mark message as read
  markAsRead(messageId) {
    return fetchAPI(`/chat-messages/${messageId}/read`, {
      method: 'PUT',
    });
  },
};

/**
 * Analytics API Endpoints
 */
export const analyticsAPI = {
  // Get dashboard overview
  getDashboardOverview(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/analytics/dashboard${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get metrics by date range
  getMetricsByDateRange(startDate, endDate) {
    return fetchAPI(`/analytics/metrics/date-range?startDate=${startDate}&endDate=${endDate}`);
  },
  
  // Get latest metrics
  getLatestMetrics(limit = 7) {
    return fetchAPI(`/analytics/metrics/latest?limit=${limit}`);
  },
  
  // Get events by type
  getEventsByType(eventType, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/analytics/events/type/${eventType}${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get events by user
  getEventsByUser(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/analytics/events/user/${userId}${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get events by session
  getEventsBySession(sessionId) {
    return fetchAPI(`/analytics/events/session/${sessionId}`);
  },
  
  // Get user growth data
  getUserGrowth(days = 30) {
    return fetchAPI(`/analytics/growth/users?days=${days}`);
  },
  
  // Get session trends
  getSessionTrends(days = 30) {
    return fetchAPI(`/analytics/trends/sessions?days=${days}`);
  },
  
  // Create event
  createEvent(data) {
    return fetchAPI('/analytics/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * User Preferences API Endpoints
 */
export const userPreferencesAPI = {
  // Get preferences by user ID
  getByUser(userId) {
    return fetchAPI(`/users/${userId}/preferences`);
  },
  
  // Get specific preference
  getPreference(userId, key) {
    return fetchAPI(`/users/${userId}/preferences/${key}`);
  },
  
  // Set preference
  setPreference(userId, key, value) {
    return fetchAPI(`/users/${userId}/preferences`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  },
  
  // Delete preference
  deletePreference(userId, key) {
    return fetchAPI(`/users/${userId}/preferences/${key}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Dashboard API Endpoints
 */
export const dashboardAPI = {
  // Get dashboard statistics
  getStats(period = 7) {
    return fetchAPI(`/dashboard/stats?period=${period}`);
  },
  
  // Get user growth data
  getUserGrowth(days = 30) {
    return fetchAPI(`/dashboard/growth/users?days=${days}`);
  },
  
  // Get session trends
  getSessionTrends(days = 30) {
    return fetchAPI(`/dashboard/trends/sessions?days=${days}`);
  },
  
  // Get hourly activity heatmap
  getHourlyActivity(days = 7) {
    return fetchAPI(`/dashboard/activity/hourly?days=${days}`);
  },
  
  // Get top flow steps
  getTopFlowSteps(limit = 10) {
    return fetchAPI(`/dashboard/flow-steps/top?limit=${limit}`);
  },
  
  // Get real-time stats
  getRealTimeStats() {
    return fetchAPI('/dashboard/realtime');
  },
  
  // Get conversion funnel
  getConversionFunnel(days = 7) {
    return fetchAPI(`/dashboard/funnel?days=${days}`);
  },
};

export default {
  user: userAPI,
  session: sessionAPI,
  sessionFlow: sessionFlowAPI,
  chatMessage: chatMessageAPI,
  analytics: analyticsAPI,
  userPreferences: userPreferencesAPI,
  dashboard: dashboardAPI,
};
