<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectStore } from "../stores/organization";
import { projectAPI } from "../services/api";
import { AgGridVue } from "ag-grid-vue3";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
import SessionJourneyBlock from "../components/organisms/SessionJourneyBlock.vue";
import BaseAvatar from "../components/atoms/BaseAvatar.vue";
import StatusBadge from "../components/atoms/StatusBadge.vue";
import {ArrowLeft,Users,Activity,MessageSquare,Clock,TrendingUp,RefreshCw,Calendar,BarChart3,Phone,Globe,UserCircle,X} from "lucide-vue-next";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

console.log("projectStore:",projectStore.currentProject)

const loading = ref(false);
const projectId = computed(() => route.params.id);

const project = computed(() => projectStore.currentProject);

const selectedUserId = ref(null);
const userSessionsLoading = ref(false);
const currentPage = ref(1);
const usersPerPage = 20;

const stats = ref({
  totalUsers: 0,
  totalSessions: 0,
  totalMessages: 0,
  avgSessionDuration: 0,
  activeUsers: 0,
});

const users = ref([]);
const userSessions = ref([]);
const sessionFlows = ref([]);
const activeView = ref("overview"); // 'users' or 'overview'

// AG Grid configuration
const columnDefs = ref([
  {
    headerName: "Name",
    field: "name",
    sortable: true,
    filter: true,
    flex: 2,
    cellRenderer: (params) => {
      if (!params.value) return '<span class="font-medium">Unknown</span>';
      const initial = params.value[0].toUpperCase();
      return `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #2563eb); display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-weight: 600; font-size: 12px;">${initial}</span>
          </div>
          <span style="font-weight: 500;">${params.value}</span>
        </div>
      `;
    },
  },
  {
    headerName: "Phone",
    field: "phoneNumber",
    sortable: true,
    filter: true,
    flex: 1.5,
    valueFormatter: (params) => {
      if (!params.value) return "N/A";
      return params.value.replace(/^\+\d{1,3}/, "");
    },
  },
  {
    headerName: "Sessions",
    field: "sessionCount",
    sortable: true,
    flex: 1,
    cellStyle: { textAlign: "center", justifyContent: "center" },
  },
  {
    headerName: "Messages",
    field: "messageCount",
    sortable: true,
    flex: 1,
    cellStyle: { textAlign: "center", justifyContent: "center" },
  },
  {
    headerName: "Last Active",
    field: "lastActive",
    sortable: true,
    flex: 1.5,
    valueFormatter: (params) => {
      if (!params.value) return "Never";
      const date = new Date(params.value);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    },
  },
]);

const defaultColDef = ref({
  resizable: true,
  sortable: true,
  suppressMovable: true,
});

const gridApi = ref(null);

const onGridReady = (params) => {
  gridApi.value = params.api;
  console.log("Grid ready, current users:", users.value.length);
  console.log("Grid API:", params.api);
};

const onRowClicked = (event) => {
  console.log("Row clicked:", event.data);
  selectedUserId.value = event.data._id;
};

const closeUserJourney = () => {
  selectedUserId.value = null; // this will hide the right panel
};

// Computed properties
const selectedUser = computed(() => {
  if (!selectedUserId.value) return null;
  return users.value.find((u) => u._id === selectedUserId.value);
});

const formattedUsers = computed(() => {
  return users.value.map((user) => ({
    id: user._id,
    name: user.name || "Unknown User",
    phone_number: user.phoneNumber,
    last_active: user.lastActive,
    user_type:
      user.sessionCount > 5
        ? "ACTIVE"
        : user.sessionCount > 1
        ? "RETURNING"
        : "NEW",
    sessions_count: user.sessionCount,
    metadata: user.metadata,
  }));
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * usersPerPage;
  const end = start + usersPerPage;
  return formattedUsers.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(formattedUsers.value.length / usersPerPage);
});

const userStats = computed(() => {

  if (!selectedUser.value) return null;

  const totalDuration = userSessions.value.reduce(
    (sum, s) => sum + (s.duration_seconds || 0),
    0
  );

  const avgDuration =
    userSessions.value.length > 0
      ? Math.round(totalDuration / userSessions.value.length)
      : 0;
      
  const totalSteps = sessionFlows.value.length;

  return {
    totalSessions: userSessions.value.length,
    avgDuration,
    totalSteps,
    avgStepsPerSession:
      userSessions.value.length > 0
        ? Math.round(totalSteps / userSessions.value.length)
        : 0,
  };
});

const goBack = () => {
  if (project.value?.organizationId) {
    const orgId =
      typeof project.value.organizationId === "object"
        ? project.value.organizationId._id
        : project.value.organizationId;
    router.push(`/organizations/${orgId}/projects`);
  } else {
    router.push("/");
  }
};

const switchView = (view) => {
  console.log("Switching view to:", view);
  activeView.value = view;
  if (view === "overview") {
    selectedUserId.value = null;
    console.log("Stats data:", stats.value);
  }
  console.log("Current activeView:", activeView.value);
};

const fetchProjectData = async () => {
  loading.value = true;
  try {
    if (project.value) {
      // Fetch real users from API
      const response = await projectAPI.getUsers(projectId.value);
      if (response.success) {
        users.value = response.data;
        console.log("Users loaded:", users.value.length, users.value);

        // Calculate stats
        stats.value = {
          totalUsers: response.data.length,
          totalSessions: response.data.reduce(
            (sum, u) => sum + (u.sessionCount || 0),
            0
          ),
          totalMessages: response.data.reduce(
            (sum, u) => sum + (u.messageCount || 0),
            0
          ),
          avgSessionDuration: 0,
          activeUsers: response.data.filter((u) => {
            if (!u.lastActive) return false;
            const daysSinceActive =
              (new Date() - new Date(u.lastActive)) / (1000 * 60 * 60 * 24);
            return daysSinceActive <= 7;
          }).length,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching project data:", error);
  } finally {
    loading.value = false;
  }
};

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

const formatPhoneNumber = (phone) => {
  if (!phone) return "N/A";
  // Remove country code for display
  return phone.replace(/^\+\d{1,3}/, "");
};

const formatDate = (date) => {
  if (!date) return "Never";
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

const handleSelectUser = async (userId) => {
  selectedUserId.value = userId;
};

const fetchUserSessions = async (userId) => {
  if (!userId) return;

  console.log("Fetching sessions for user:", userId);
  userSessionsLoading.value = true;
  try {
    const API_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

    // Fetch user sessions
    const sessionResponse = await fetch(`${API_URL}/sessions/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!sessionResponse.ok) {
      console.error("Session fetch failed:", sessionResponse.status);
      throw new Error("Failed to fetch sessions");
    }
    const sessionData = await sessionResponse.json();
    console.log("Sessions received:", sessionData);

    if (sessionData.success) {
      userSessions.value = sessionData.data.map((session) => ({
        id: session._id,
        user_id: session.userId,
        start_time: session.startTime,
        end_time: session.endTime,
        duration_seconds: session.durationSeconds || 0,
        source: session.source,
        channel: session.channel,
        is_active: session.isActive,
        metadata: session.metadata,
      }));

      console.log("Mapped sessions:", userSessions.value.length);

      // Fetch flows for all sessions
      const flowPromises = sessionData.data.map(async (session) => {
        try {
          const flowResponse = await fetch(
            `${API_URL}/sessions/${session._id}/flows`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (flowResponse.ok) {
            const flowData = await flowResponse.json();
            console.log(`Flows for session ${session._id}:`, flowData);
            return flowData.success ? flowData.data : [];
          }
          return [];
        } catch (err) {
          console.error("Error fetching flows for session:", session._id, err);
          return [];
        }
      });

      const allFlows = await Promise.all(flowPromises);
      sessionFlows.value = allFlows.flat().map((flow) => ({
        id: flow._id,
        session_id: flow.sessionId,
        flow_step: flow.flowStep,
        step_order: flow.stepOrder,
        step_timestamp: flow.stepTimestamp,
        step_data: flow.stepData,
      }));

      console.log("Total flows loaded:", sessionFlows.value.length);
    }
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    userSessions.value = [];
    sessionFlows.value = [];
  } finally {
    userSessionsLoading.value = false;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Watch for user selection
watch(selectedUserId, async (newUserId) => {
  if (newUserId) {
    await fetchUserSessions(newUserId);
  } else {
    userSessions.value = [];
    sessionFlows.value = [];
  }
});

onMounted(async () => {
  loading.value = true;
  try {
    // Find project in store
    if (!project.value || project.value._id !== projectId.value) {
      // Need to fetch project
      const storedProject = projectStore.projects.find(
        (p) => p._id === projectId.value
      );
      if (storedProject) {
        projectStore.setCurrentProject(projectId.value);
      } else {
        // Fetch projects if not in store
        await projectStore.fetchProjects();
        projectStore.setCurrentProject(projectId.value);
      }
    }

    await fetchProjectData();
  } catch (error) {
    console.error("Error loading project:", error);
  } finally {
    loading.value = false;
  }
});


</script>


<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-5">
      <div class="flex items-center gap-4 mb-3">
        <button
          @click="goBack"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft :size="24" class="text-gray-600" />
        </button>
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h1 v-if="project" class="text-2xl font-bold text-gray-900">
              {{ project.name }}
            </h1>
            <span
              v-if="project"
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                project.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700',
              ]"
            >
              {{ project.status }}
            </span>
          </div>
        </div>
        <button
          @click="fetchProjectData"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw :size="18" :class="{ 'animate-spin': loading }" />
          Refresh
        </button>
      </div>

      <!-- Project Info -->
      <div v-if="project" class="flex items-center gap-6 text-sm">
        <div class="flex items-center gap-2">
          <BarChart3 :size="16" class="text-gray-500" />
          <span class="text-gray-600">{{ project.type }}</span>
        </div>
        <div v-if="project.organizationId" class="flex items-center gap-2">
          <span class="text-gray-400">•</span>
          <span class="text-gray-600">{{
            typeof project.organizationId === "object"
              ? project.organizationId.name
              : "Organization"
          }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Calendar :size="16" class="text-gray-500" />
          <span class="text-gray-600"
            >Created
            {{ new Date(project.createdAt).toLocaleDateString() }}</span
          >
        </div>
      </div>
    </div>

    <!-- View Toggle Tabs -->
    <div class="bg-white border-b border-gray-200 px-6">
      <div class="flex gap-4">
        <button
          @click="switchView('overview')"
          :class="[
            'px-4 py-3 font-medium text-sm transition-all relative',
            activeView === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900',
          ]"
        >
          <div class="flex items-center gap-2 cursor-pointer">
            <BarChart3 :size="18" />
            <span>Project Overview</span>
          </div>

        </button>
        <button
          @click="switchView('users')"
          :class="[
            'px-4 py-3 font-medium text-sm transition-all relative',
            activeView === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900',
          ]"
        >
          <div class="flex items-center gap-2 cursor-pointer">
            <Users :size="18" />
            <span>Users & Journey</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Users & Journey View -->
      <div v-if="activeView === 'users'" class="h-full flex gap-6 p-6">
        <!-- Users Grid (Left - when no user selected, full width. When user selected, 40%) -->
        <div
          :class="selectedUser ? 'w-2/5' : 'w-full'"
          class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col transition-all"
        >
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">Project Users</h2>
            <p class="text-sm text-gray-600 mt-1">
              {{ users.length }} users total
            </p>
          </div>

          <div v-if="loading" class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <RefreshCw
                :size="48"
                class="animate-spin text-blue-500 mx-auto mb-4"
              />
              <p class="text-gray-600">Loading users...</p>
            </div>
          </div>

          <div
            v-else-if="users.length === 0"
            class="flex-1 flex items-center justify-center"
          >
            <div class="text-center">
              <Users :size="64" class="text-gray-300 mx-auto mb-4" />
              <p class="text-gray-600">No users found in this project</p>
            </div>
          </div>

          <div v-else class="flex-1 overflow-hidden p-2" style="min-height: 0">
            <ag-grid-vue
              style="width: 100%; height: 100%"
              class="ag-theme-alpine"
              :columnDefs="columnDefs"
              :rowData="users"
              :defaultColDef="defaultColDef"
              :pagination="true"
              :paginationPageSize="20"
              :paginationAutoPageSize="false"
              :animateRows="true"
              :rowSelection="{ mode: 'singleRow' }"
              :suppressCellFocus="true"
              @grid-ready="onGridReady"
              @row-clicked="onRowClicked"
            >
            </ag-grid-vue>
          </div>
        </div>

        <!-- Journey View (Right 60% - only when user selected) -->
        <div
          v-if="selectedUser"
          class="w-3/5 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden"
        >
          <!-- User Journey View -->
          <div class="flex flex-col h-full overflow-hidden">
            <!-- User Header -->
            <div class="bg-gray-50 p-6 border-b border-gray-200">

              <div class="bg-gray-50 p-6 border-b border-gray-200 relative mb-5 pb-10">
                <button
                  @click="closeUserJourney"
                  class="absolute cursor-pointer top-4 right-4 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Close"
                >
                  <X :size="18" class="text-gray-700" />
                </button>

           
              </div>

              <div class="flex items-center gap-4">
                <BaseAvatar :name="selectedUser.name" size="xl" />

                <div class="flex-1">
                  <h2 class="text-xl font-bold text-gray-900 mb-1">
                    {{ selectedUser.name || "Unknown User" }}
                  </h2>
                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <div class="flex items-center gap-2">
                      <Phone :size="14" />
                      <span>{{ selectedUser.phoneNumber }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <MessageSquare :size="14" />
                      <span>{{ selectedUser.messageCount }} messages</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- User Stats -->
              <div class="grid grid-cols-3 gap-4 mt-4">
                <div
                  class="bg-white rounded-lg p-3 text-center border border-gray-200"
                >
                  <p class="text-xs text-gray-500 mb-1">Sessions</p>
                  <p class="text-lg font-bold text-gray-900">
                    {{ selectedUser.sessionCount }}
                  </p>
                </div>
                <div
                  class="bg-white rounded-lg p-3 text-center border border-gray-200"
                >
                  <p class="text-xs text-gray-500 mb-1">Messages</p>
                  <p class="text-lg font-bold text-gray-900">
                    {{ selectedUser.messageCount }}
                  </p>
                </div>
                <div
                  class="bg-white rounded-lg p-3 text-center border border-gray-200"
                >
                  <p class="text-xs text-gray-500 mb-1">Last Active</p>
                  <p class="text-xs font-semibold text-gray-900">
                    {{ formatRelativeTime(selectedUser.lastActive) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Sessions List -->
            <div class="flex-1 overflow-y-auto p-6">
              <div
                v-if="userSessionsLoading"
                class="flex items-center justify-center h-full"
              >
                <div class="text-center">
                  <RefreshCw
                    :size="48"
                    class="animate-spin text-blue-500 mx-auto mb-4"
                  />
                  <p class="text-gray-600">Loading sessions...</p>
                </div>
              </div>

              <div
                v-else-if="userSessions.length === 0"
                class="flex items-center justify-center h-full"
              >
                <div class="text-center">
                  <Activity :size="64" class="text-gray-300 mx-auto mb-4" />
                  <p class="text-gray-600 text-lg mb-2">No sessions found</p>
                  <p class="text-gray-500 text-sm">
                    This user hasn't had any sessions yet
                  </p>
                </div>
              </div>

              <div v-else class="space-y-4">
                <h3
                  class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4"
                >
                  Session History ({{ userSessions.length }})
                </h3>
                <SessionJourneyBlock
                  v-for="session in userSessions"
                  :key="session.id"
                  :session="session"
                  :flows="
                    sessionFlows.filter((f) => f.session_id === session.id)
                  "
                />
              </div>
            </div>
          </div>
        </div>
        <!-- End Users & Journey View -->
      </div>

      <!-- Project Overview (Full Width) -->
      <div v-if="activeView === 'overview'" class="h-full overflow-y-auto p-6">
        <div class="max-w-7xl mx-auto">
          <!-- Key Metrics -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div
              class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs opacity-90 mb-1">Total Users</p>
                  <p class="text-2xl font-bold">{{ stats.totalUsers }}</p>
                </div>
                <Users :size="32" class="opacity-80" />
              </div>
            </div>

            <div
              class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs opacity-90 mb-1">Total Sessions</p>
                  <p class="text-2xl font-bold">{{ stats.totalSessions }}</p>
                </div>
                <Activity :size="32" class="opacity-80" />
              </div>
            </div>

            <div
              class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs opacity-90 mb-1">Active Users</p>
                  <p class="text-2xl font-bold">{{ stats.activeUsers }}</p>
                </div>
                <TrendingUp :size="32" class="opacity-80" />
              </div>
            </div>

            <div
              class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs opacity-90 mb-1">Messages</p>
                  <p class="text-2xl font-bold">{{ stats.totalMessages }}</p>
                </div>
                <MessageSquare :size="32" class="opacity-80" />
              </div>
            </div>
          </div>

          <!-- Analytics Dashboard - Full Width -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 class="text-xl font-bold text-gray-900 mb-6">
              Analytics Dashboard
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Chart placeholders -->
              <div
                class="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300"
              >
                <div class="text-center">
                  <BarChart3 :size="64" class="text-gray-400 mx-auto mb-4" />
                  <p class="text-gray-600 font-medium text-lg">
                    Sessions Over Time
                  </p>
                  <p class="text-sm text-gray-500 mt-2">
                    Line chart placeholder
                  </p>
                </div>
              </div>
              <div
                class="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300"
              >
                <div class="text-center">
                  <Activity :size="64" class="text-gray-400 mx-auto mb-4" />
                  <p class="text-gray-600 font-medium text-lg">
                    User Engagement
                  </p>
                  <p class="text-sm text-gray-500 mt-2">
                    Bar chart placeholder
                  </p>
                </div>
              </div>
              <div
                class="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300"
              >
                <div class="text-center">
                  <TrendingUp :size="64" class="text-gray-400 mx-auto mb-4" />
                  <p class="text-gray-600 font-medium text-lg">
                    Conversion Funnel
                  </p>
                  <p class="text-sm text-gray-500 mt-2">
                    Funnel chart placeholder
                  </p>
                </div>
              </div>
              <div
                class="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300"
              >
                <div class="text-center">
                  <MessageSquare
                    :size="64"
                    class="text-gray-400 mx-auto mb-4"
                  />
                  <p class="text-gray-600 font-medium text-lg">
                    Message Volume
                  </p>
                  <p class="text-sm text-gray-500 mt-2">
                    Area chart placeholder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

/* AG Grid Custom Styles */
:deep(.ag-theme-alpine) {
  --ag-row-height: 52px;
  --ag-header-height: 48px;
  --ag-font-size: 14px;
  --ag-row-hover-color: #f3f4f6;
  --ag-selected-row-background-color: #eff6ff;
  --ag-header-background-color: #f9fafb;
  --ag-border-color: #e5e7eb;
}

:deep(.ag-root-wrapper) {
  border: none;
}

:deep(.ag-header) {
  border-bottom: 2px solid #e5e7eb;
}

:deep(.ag-cell) {
  display: flex;
  align-items: center;
  padding: 0 16px;
}

:deep(.ag-row) {
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.ag-row:hover) {
  background-color: #f9fafb !important;
}

:deep(.ag-row-selected) {
  background-color: #eff6ff !important;
}

:deep(.ag-paging-panel) {
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
}
</style>
