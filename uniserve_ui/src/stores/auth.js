import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const token = ref(localStorage.getItem('auth_token') || null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isSuperAdmin = computed(() => user.value?.role === 'SUPER_ADMIN');
  const isOrgAdmin = computed(() => user.value?.role === 'ORG_ADMIN');
  const currentOrganization = computed(() => user.value?.organizationId);

  // Actions
  async function login(email, password) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        token.value = response.data.token;
        user.value = response.data.user;
        
        // Store token in localStorage
        localStorage.setItem('auth_token', response.data.token);
        
        return true;
      } else {
        error.value = response.error || 'Login failed';
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      error.value = err.response?.data?.error || err.message || 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('auth_token');
  }

  async function fetchCurrentUser() {
    if (!token.value) return false;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authAPI.getCurrentUser();
      
      if (response.success) {
        user.value = response.data;
        return true;
      } else {
        // Token invalid, clear auth state
        await logout();
        return false;
      }
    } catch (err) {
      // Token invalid, clear auth state
      await logout();
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(currentPassword, newPassword) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        return true;
      } else {
        error.value = response.error || 'Password change failed';
        return false;
      }
    } catch (err) {
      error.value = err.response?.data?.error || err.message || 'Password change failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    isSuperAdmin,
    isOrgAdmin,
    currentOrganization,
    // Actions
    login,
    logout,
    fetchCurrentUser,
    changePassword,
  };
});
