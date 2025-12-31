<script setup>
import { ref, computed, watch } from 'vue';
import DashboardSplitLayout from '../components/templates/DashboardSplitLayout.vue';
import UserListSidebar from '../components/organisms/UserListSidebar.vue';
import SessionJourneyBlock from '../components/organisms/SessionJourneyBlock.vue';
import BaseAvatar from '../components/atoms/BaseAvatar.vue';
import StatusBadge from '../components/atoms/StatusBadge.vue';
import TimeLabel from '../components/atoms/TimeLabel.vue';
import { useRealData } from '../composables/useRealData';
import { UserCircle, Activity, MessageSquare, TrendingUp, RefreshCw } from 'lucide-vue-next';

// Load real data from API
const { users, sessions, sessionFlows, loading, error, fetchUserSessions, refreshData } = useRealData();

// State
const selectedUserId = ref(null);
const userSessionsLoading = ref(false);

// Watch for user selection and fetch their sessions
watch(selectedUserId, async (newUserId) => {
  if (newUserId) {
    userSessionsLoading.value = true;
    await fetchUserSessions(newUserId);
    userSessionsLoading.value = false;
  }
});

// Computed
const selectedUser = computed(() => {
  if (!selectedUserId.value) return null;
  return users.value.find(u => u.id === selectedUserId.value);
});

const userSessions = computed(() => {
  if (!selectedUserId.value) return [];
  return sessions.value
    .filter(s => s.user_id === selectedUserId.value)
    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time)); // Most recent first
});

const userStats = computed(() => {
  if (!selectedUser.value) return null;
  
  const totalSessions = userSessions.value.length;
  const totalDuration = userSessions.value.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
  
  const userFlows = sessionFlows.value.filter(f => 
    userSessions.value.some(s => s.id === f.session_id)
  );
  const totalSteps = userFlows.length;
  
  return {
    totalSessions,
    avgDuration,
    totalSteps,
    avgStepsPerSession: totalSessions > 0 ? Math.round(totalSteps / totalSessions) : 0
  };
});

// Methods
const handleSelectUser = (userId) => {
  selectedUserId.value = userId;
};

const handleRefresh = async () => {
  await refreshData();
  if (selectedUserId.value) {
    await fetchUserSessions(selectedUserId.value);
  }
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
};
</script>

<template>
  <DashboardSplitLayout>
    <!-- Left Sidebar -->
    <template #sidebar>
      <div class="flex flex-col h-full">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">Users</h2>
          <button
            @click="handleRefresh"
            :disabled="loading"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw :size="18" :class="{ 'animate-spin': loading }" class="text-gray-600" />
          </button>
        </div>
        
        <div v-if="error" class="p-4 bg-red-50 border-b border-red-200">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
        
        <div v-if="loading && users.length === 0" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <RefreshCw :size="32" class="animate-spin text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-500">Loading users...</p>
          </div>
        </div>
        
        <UserListSidebar
          v-else
          :users="users"
          :selectedUserId="selectedUserId"
          @select-user="handleSelectUser"
        />
      </div>
    </template>
    
    <!-- Right Content Area -->
    <template #content>
      <!-- Empty State -->
      <div 
        v-if="!selectedUser"
        class="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <div class="text-center">
          <UserCircle :size="80" class="mx-auto mb-4 text-gray-300" />
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No User Selected</h3>
          <p class="text-gray-500">Select a user from the sidebar to view their journey</p>
        </div>
      </div>
      
      <!-- User Journey Content -->
      <div v-else class="flex flex-col h-full bg-gray-50">
        <!-- Sticky Header with User Profile -->
        <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div class="p-6">
            <div class="flex items-start gap-4">
              <BaseAvatar :name="selectedUser.name" size="xl" />
              
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h1 class="text-2xl font-bold text-gray-900">
                    {{ selectedUser.name || 'Unknown User' }}
                  </h1>
                  <StatusBadge :status="selectedUser.user_type" />
                </div>
                
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <span>{{ selectedUser.phone_number }}</span>
                  <span>•</span>
                  <span>{{ selectedUser.language?.toUpperCase() }}</span>
                  <span>•</span>
                  <TimeLabel 
                    :timestamp="selectedUser.last_active" 
                    format="relative"
                    :showIcon="true"
                  />
                </div>
              </div>
            </div>
            
            <!-- User Stats Cards -->
            <div class="grid grid-cols-4 gap-4 mt-6">
              <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div class="flex items-center gap-2 mb-2">
                  <Activity :size="18" class="text-blue-600" />
                  <span class="text-xs font-medium text-blue-900">Sessions</span>
                </div>
                <p class="text-2xl font-bold text-blue-700">{{ userStats.totalSessions }}</p>
              </div>
              
              <div class="bg-green-50 rounded-lg p-4 border border-green-100">
                <div class="flex items-center gap-2 mb-2">
                  <MessageSquare :size="18" class="text-green-600" />
                  <span class="text-xs font-medium text-green-900">Journey Steps</span>
                </div>
                <p class="text-2xl font-bold text-green-700">{{ userStats.totalSteps }}</p>
              </div>
              
              <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div class="flex items-center gap-2 mb-2">
                  <TrendingUp :size="18" class="text-purple-600" />
                  <span class="text-xs font-medium text-purple-900">Avg Duration</span>
                </div>
                <p class="text-2xl font-bold text-purple-700">{{ formatDuration(userStats.avgDuration) }}</p>
              </div>
              
              <div class="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <div class="flex items-center gap-2 mb-2">
                  <Activity :size="18" class="text-amber-600" />
                  <span class="text-xs font-medium text-amber-900">Steps/Session</span>
                </div>
                <p class="text-2xl font-bold text-amber-700">{{ userStats.avgStepsPerSession }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Journey Timeline -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="userSessionsLoading" class="text-center py-12">
            <RefreshCw :size="48" class="animate-spin mx-auto mb-3 text-gray-400" />
            <h3 class="text-lg font-semibold text-gray-700 mb-1">Loading Sessions...</h3>
            <p class="text-gray-500">Fetching user journey data</p>
          </div>
          
          <div v-else-if="userSessions.length === 0" class="text-center py-12">
            <Activity :size="48" class="mx-auto mb-3 text-gray-300" />
            <h3 class="text-lg font-semibold text-gray-700 mb-1">No Sessions Yet</h3>
            <p class="text-gray-500">This user hasn't started any sessions</p>
          </div>
          
          <div v-else>
            <div class="flex items-center gap-2 mb-6">
              <div class="h-px flex-1 bg-gray-300"></div>
              <h2 class="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Journey Timeline ({{ userSessions.length }} Sessions)
              </h2>
              <div class="h-px flex-1 bg-gray-300"></div>
            </div>
            
            <SessionJourneyBlock
              v-for="session in userSessions"
              :key="session.id"
              :session="session"
              :flows="sessionFlows"
            />
          </div>
        </div>
      </div>
    </template>
  </DashboardSplitLayout>
</template>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
