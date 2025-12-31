import { ref, computed, onMounted } from 'vue';
import { userAPI, sessionAPI, sessionFlowAPI } from '../services/api';

/**
 * Real Data Fetcher for UniServe Dashboard
 * Replaces mock data with actual API calls
 */
export function useRealData() {
  // State
  const users = ref([]);
  const sessions = ref([]);
  const sessionFlows = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await userAPI.getAll();
      
      // Map MongoDB _id to id for compatibility with UI
      users.value = response.data.map(user => ({
        id: user._id,
        phone_number: user.phoneNumber,
        name: user.name,
        language: user.language,
        user_type: user.userType,
        first_seen: user.firstSeen,
        last_active: user.lastActive,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
      error.value = err.message;
      users.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await sessionAPI.getAll();
      
      // Map MongoDB _id to id and normalize field names
      sessions.value = response.data.map(session => ({
        id: session._id,
        user_id: session.userId,
        source: session.source,
        channel: session.channel,
        start_time: session.startTime,
        end_time: session.endTime,
        duration_seconds: session.durationSeconds,
        is_active: session.isActive,
        metadata: session.metadata,
      }));
    } catch (err) {
      console.error('Error fetching sessions:', err);
      error.value = err.message;
      sessions.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Fetch session flows for a specific session
  const fetchSessionFlows = async (sessionId) => {
    try {
      const response = await sessionFlowAPI.getBySession(sessionId);
      
      // Map MongoDB _id to id and normalize field names
      return response.data.map(flow => ({
        id: flow._id,
        session_id: flow.sessionId,
        flow_step: flow.flowStep,
        step_order: flow.stepOrder,
        step_timestamp: flow.stepTimestamp,
        step_data: flow.stepData,
      }));
    } catch (err) {
      console.error(`Error fetching flows for session ${sessionId}:`, err);
      return [];
    }
  };

  // Fetch all session flows for all sessions
  const fetchAllSessionFlows = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      // Fetch flows for each session
      const flowPromises = sessions.value.map(session => 
        fetchSessionFlows(session.id)
      );
      
      const flowsArrays = await Promise.all(flowPromises);
      sessionFlows.value = flowsArrays.flat();
    } catch (err) {
      console.error('Error fetching session flows:', err);
      error.value = err.message;
      sessionFlows.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Fetch sessions for a specific user
  const fetchUserSessions = async (userId) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await sessionAPI.getByUser(userId);
      
      const userSessions = response.data.map(session => ({
        id: session._id,
        user_id: session.userId,
        source: session.source,
        channel: session.channel,
        start_time: session.startTime,
        end_time: session.endTime,
        duration_seconds: session.durationSeconds,
        is_active: session.isActive,
        metadata: session.metadata,
      }));

      // Update the sessions array with user sessions
      sessions.value = [
        ...sessions.value.filter(s => s.user_id !== userId),
        ...userSessions
      ];

      // Fetch flows for these sessions
      const flowPromises = userSessions.map(session => 
        fetchSessionFlows(session.id)
      );
      
      const flowsArrays = await Promise.all(flowPromises);
      const userFlows = flowsArrays.flat();
      
      // Update session flows
      sessionFlows.value = [
        ...sessionFlows.value.filter(f => 
          !userSessions.some(s => s.id === f.session_id)
        ),
        ...userFlows
      ];

      return userSessions;
    } catch (err) {
      console.error(`Error fetching sessions for user ${userId}:`, err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await fetchUsers();
    await fetchSessions();
    await fetchAllSessionFlows();
  };

  // Auto-refresh interval (optional)
  const startAutoRefresh = (intervalMs = 30000) => {
    const intervalId = setInterval(refreshData, intervalMs);
    return () => clearInterval(intervalId);
  };

  // Computed: Get sessions for a specific user
  const getUserSessions = computed(() => (userId) => {
    return sessions.value.filter(s => s.user_id === userId);
  });

  // Computed: Get flows for a specific session
  const getSessionFlows = computed(() => (sessionId) => {
    return sessionFlows.value.filter(f => f.session_id === sessionId);
  });

  // Initialize data on mount
  onMounted(() => {
    refreshData();
  });

  return {
    // State
    users,
    sessions,
    sessionFlows,
    loading,
    error,
    
    // Methods
    fetchUsers,
    fetchSessions,
    fetchAllSessionFlows,
    fetchUserSessions,
    fetchSessionFlows,
    refreshData,
    startAutoRefresh,
    
    // Computed
    getUserSessions,
    getSessionFlows,
  };
}
