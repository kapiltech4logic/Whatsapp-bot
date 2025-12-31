<script setup>
import { Menu, User, LogOut, ChevronDown } from 'lucide-vue-next';
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const showUserMenu = ref(false);

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

const getRoleBadgeColor = (role) => {
  const colors = {
    'SUPER_ADMIN': 'bg-purple-100 text-purple-700 border-purple-200',
    'ORG_ADMIN': 'bg-blue-100 text-blue-700 border-blue-200',
    'PROJECT_MANAGER': 'bg-green-100 text-green-700 border-green-200',
    'VIEWER': 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
};
</script>

<template>
  <div class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
    <!-- Left side - can be used for breadcrumbs or page title -->
    <div class="flex items-center gap-4">
      <img 
        src="/UniServe_logo.png" 
        alt="UniServe" 
        class="h-8 w-auto object-contain"
      />
    </div>

    <!-- Right side - User info -->
    <div class="relative">
      <button
        @click="showUserMenu = !showUserMenu"
        class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <!-- User Avatar -->
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          {{ authStore.user?.email?.charAt(0).toUpperCase() }}
        </div>

        <!-- User Details -->
        <div class="text-left hidden md:block">
          <div class="text-sm font-medium text-gray-900">
            {{ authStore.user?.metadata?.firstName || authStore.user?.email?.split('@')[0] }}
          </div>
          <div class="text-xs text-gray-500">
            {{ authStore.user?.role?.replace('_', ' ') }}
          </div>
        </div>

        <ChevronDown :size="16" class="text-gray-400" />
      </button>

      <!-- Dropdown Menu -->
      <div
        v-if="showUserMenu"
        @click="showUserMenu = false"
        class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
      >
        <!-- User Info -->
        <div class="px-4 py-3 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {{ authStore.user?.email?.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-900 truncate">
                {{ authStore.user?.metadata?.firstName || 'User' }}
                {{ authStore.user?.metadata?.lastName || '' }}
              </div>
              <div class="text-xs text-gray-500 truncate">
                {{ authStore.user?.email }}
              </div>
            </div>
          </div>
          
          <!-- Role Badge -->
          <div class="mt-2">
            <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', getRoleBadgeColor(authStore.user?.role)]">
              {{ authStore.user?.role?.replace('_', ' ') }}
            </span>
          </div>
        </div>

        <!-- Menu Items -->
        <div class="py-1">
          <button
            class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <User :size="16" />
            Profile Settings
          </button>
        </div>

        <!-- Logout -->
        <div class="border-t border-gray-100 py-1">
          <button
            @click="handleLogout"
            class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <LogOut :size="16" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Close dropdown when clicking outside */
</style>
