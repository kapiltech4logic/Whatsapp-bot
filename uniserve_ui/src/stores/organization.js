import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { organizationAPI, projectAPI } from '../services/api';

export const useOrganizationStore = defineStore('organization', () => {
  // State
  const organizations = ref([]);
  const currentOrganization = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const hasOrganizations = computed(() => organizations.value.length > 0);
  const currentOrgName = computed(() => currentOrganization.value?.name || 'Select Organization');

  // Actions
  async function fetchOrganizations() {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await organizationAPI.getAll();
      
      if (response.success) {
        organizations.value = response.data;
        
        // Auto-select first org if only one exists
        if (organizations.value.length === 1) {
          currentOrganization.value = organizations.value[0];
        }
        
        return true;
      } else {
        error.value = response.error || 'Failed to fetch organizations';
        return false;
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
      error.value = err.message || 'Failed to fetch organizations';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function setCurrentOrganization(org) {
    currentOrganization.value = org;
  }

  function clearOrganization() {
    currentOrganization.value = null;
  }

  return {
    // State
    organizations,
    currentOrganization,
    loading,
    error,
    // Getters
    hasOrganizations,
    currentOrgName,
    // Actions
    fetchOrganizations,
    setCurrentOrganization,
    clearOrganization,
  };
});

export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref([]);
  const currentProject = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const hasProjects = computed(() => projects.value.length > 0);
  const currentProjectName = computed(() => currentProject.value?.name || 'Select Project');
  const activeProjects = computed(() => projects.value.filter(p => p.status === 'ACTIVE'));

  // Actions
  async function fetchProjects(organizationId = null) {
    loading.value = true;
    error.value = null;
    
    try {
      // Build query params
      const params = new URLSearchParams();
      if (organizationId) {
        params.append('organizationId', organizationId);
      }
      
      const queryString = params.toString() ? '?' + params.toString() : '';
      const response = await projectAPI.getAll(queryString);
      
      if (response.success) {
        projects.value = response.data;
        
        // Auto-select first project if only one exists
        if (projects.value.length === 1) {
          currentProject.value = projects.value[0];
        }
        
        return true;
      } else {
        error.value = response.error || 'Failed to fetch projects';
        return false;
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      error.value = err.message || 'Failed to fetch projects';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function setCurrentProject(projectId) {
    const project = projects.value.find(p => p._id === projectId);
    if (project) {
      currentProject.value = project;
    }
  }

  function clearProject() {
    currentProject.value = null;
  }

  return {
    // State
    projects,
    currentProject,
    loading,
    error,
    // Getters
    hasProjects,
    currentProjectName,
    activeProjects,
    // Actions
    fetchProjects,
    setCurrentProject,
    clearProject,
  };
});
