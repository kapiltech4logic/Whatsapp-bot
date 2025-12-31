<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrganizationStore, useProjectStore } from '../stores/organization';
import { FolderKanban, ArrowLeft, Plus, Calendar, Users, Activity } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const organizationStore = useOrganizationStore();
const projectStore = useProjectStore();

const loading = ref(false);
const organizationId = computed(() => route.params.id);
const organization = computed(() => 
  organizationStore.organizations.find(org => org._id === organizationId.value)
);

// Projects are directly from store (filtered by API)
const organizationProjects = computed(() => projectStore.projects);

const goBack = () => {
  router.push('/');
};

const handleProjectClick = (project) => {
  // Navigate to project analytics dashboard
  router.push(`/projects/${project._id}/analytics`);
};

onMounted(async () => {
  loading.value = true;
  try {
    // Fetch organizations if not loaded
    if (!organizationStore.organizations.length) {
      await organizationStore.fetchOrganizations();
    }
    
    // Fetch projects for this organization
    await projectStore.fetchProjects(organizationId.value);
  } finally {
    loading.value = false;
  }
});

const getProjectColorClass = (index) => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600'
  ];
  return colors[index % colors.length];
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};
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
          <h1 v-if="organization" class="text-2xl font-bold text-gray-900">{{ organization.name }}</h1>
          <p class="text-gray-500 mt-1 text-sm">Manage projects and view analytics</p>
        </div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus :size="18" />
          New Project
        </button>
      </div>

      <!-- Organization Info -->
      <div v-if="organization" class="flex items-center gap-6 text-sm">
        <div class="flex items-center gap-2">
          <FolderKanban :size="16" class="text-gray-500" />
          <span class="text-gray-600">{{ organizationProjects.length }} Projects</span>
        </div>
        <div class="flex items-center gap-2">
          <Users :size="16" class="text-gray-500" />
          <span class="text-gray-600">{{ organization.userCount || 0 }} Users</span>
        </div>
        <div class="flex items-center gap-2">
          <div :class="['w-2 h-2 rounded-full', organization.isActive ? 'bg-green-500' : 'bg-gray-300']"></div>
          <span class="text-gray-600">{{ organization.isActive ? 'Active' : 'Inactive' }}</span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="text-center">
          <Activity :size="48" class="animate-spin text-blue-500 mx-auto mb-4" />
          <p class="text-gray-600">Loading projects...</p>
        </div>
      </div>

      <!-- No Organization Found -->
      <div v-else-if="!organization" class="flex items-center justify-center h-full">
        <div class="text-center">
          <p class="text-gray-600 text-lg">Organization not found</p>
          <button @click="goBack" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>

      <!-- Projects Grid -->
      <div v-else>
        <div v-if="organizationProjects.length === 0" class="text-center py-12">
          <FolderKanban :size="64" class="text-gray-300 mx-auto mb-4" />
          <p class="text-gray-600 text-lg mb-2">No projects yet</p>
          <p class="text-gray-500 text-sm mb-4">Create your first project to get started</p>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
            <Plus :size="18" />
            Create Project
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(project, index) in organizationProjects"
            :key="project._id"
            @click="handleProjectClick(project)"
            class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden group"
          >
            <!-- Project Header with gradient -->
            <div :class="['p-6 bg-gradient-to-br', getProjectColorClass(index)]">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-xl font-bold text-white mb-1">{{ project.name }}</h3>
                  <p v-if="project.code" class="text-white/80 text-sm">{{ project.code }}</p>
                </div>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Activity :size="20" class="text-white" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Project Content -->
            <div class="p-6">
              <p v-if="project.description" class="text-gray-600 text-sm mb-4 line-clamp-2">
                {{ project.description }}
              </p>

              <!-- Project Stats -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="flex items-center gap-2">
                  <div class="p-2 bg-blue-50 rounded-lg">
                    <Users :size="18" class="text-blue-600" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Users</p>
                    <p class="text-lg font-bold text-gray-900">{{ project.userCount || 0 }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <div class="p-2 bg-green-50 rounded-lg">
                    <Activity :size="18" class="text-green-600" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Sessions</p>
                    <p class="text-lg font-bold text-gray-900">{{ project.sessionCount || 0 }}</p>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar :size="14" />
                  <span>{{ formatDate(project.createdAt) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div :class="['w-2 h-2 rounded-full', project.isActive ? 'bg-green-500' : 'bg-gray-300']"></div>
                  <span class="text-xs text-gray-500">{{ project.isActive ? 'Active' : 'Inactive' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
