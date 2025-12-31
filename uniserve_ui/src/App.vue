<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import AppSidebar from './components/organisms/AppSidebar.vue';
import AppHeader from './components/organisms/AppHeader.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Current view state for sidebar
const currentView = ref('dashboard');

// Computed property to determine if nav should be shown
const showNav = computed(() => {
  return authStore.isAuthenticated && !route.meta?.hideNav;
});

// Handle navigation from sidebar
const handleNavigate = (view) => {
  currentView.value = view;
  router.push(view === 'dashboard' ? '/' : `/${view}`);
};

// Update currentView when route changes
onMounted(() => {
  if (route.path === '/users') {
    currentView.value = 'users';
  } else {
    currentView.value = 'dashboard';
  }
});
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <!-- Sidebar (80px width) - Only show when authenticated -->
    <div v-if="showNav" class="w-20 flex-shrink-0">
      <AppSidebar :currentView="currentView" @navigate="handleNavigate" />
    </div>
    
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header - Only show when authenticated -->
      <AppHeader v-if="showNav" />
      
      <!-- Page Content -->
      <div class="flex-1 overflow-hidden">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style>
/* Ensure full viewport height */
#app {
  @apply h-screen overflow-hidden;
}

/* Global styles */
* {
  box-sizing: border-box;
}

html {
  font-size: 14px; /* Base font size for better scaling */
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 0.875rem; /* 14px */
  line-height: 1.5;
}

/* Better text sizing for headings */
h1 { font-size: 1.875rem; } /* 30px */
h2 { font-size: 1.5rem; }   /* 24px */
h3 { font-size: 1.25rem; }  /* 20px */
h4 { font-size: 1.125rem; } /* 18px */
</style>
