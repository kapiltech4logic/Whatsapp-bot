<script setup>
import { ref, computed } from 'vue';
import UserListItem from '../molecules/UserListItem.vue';
import { Search, Users } from 'lucide-vue-next';

const props = defineProps({
  users: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedUserId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['select-user']);

const searchQuery = ref('');

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) {
    return sortedUsers.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return sortedUsers.value.filter(user => {
    const nameMatch = user.name?.toLowerCase().includes(query);
    const phoneMatch = user.phone_number?.toLowerCase().includes(query);
    return nameMatch || phoneMatch;
  });
});

const sortedUsers = computed(() => {
  return [...props.users].sort((a, b) => {
    const dateA = new Date(a.last_active);
    const dateB = new Date(b.last_active);
    return dateB - dateA; // Most recent first
  });
});

const handleUserClick = (user) => {
  emit('select-user', user.id);
};
</script>

<template>
  <div class="h-full flex flex-col bg-white border-r border-gray-200">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
      <div class="flex items-center gap-2 mb-3">
        <Users :size="20" class="text-blue-600" />
        <h2 class="text-lg font-bold text-gray-900">Users</h2>
        <span class="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {{ users.length }}
        </span>
      </div>
      
      <!-- Search Bar -->
      <div class="relative">
        <Search :size="18" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or phone..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
        />
      </div>
    </div>
    
    <!-- User List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="filteredUsers.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
        <Users :size="48" class="mb-3 opacity-50" />
        <p class="text-sm">No users found</p>
      </div>
      
      <div v-else class="divide-y divide-gray-100">
        <UserListItem
          v-for="user in filteredUsers"
          :key="user.id"
          :user="user"
          :isSelected="user.id === selectedUserId"
          @click="handleUserClick"
        />
      </div>
    </div>
    
    <!-- Footer Stats -->
    <div class="p-4 border-t border-gray-200 bg-gray-50">
      <div class="grid grid-cols-3 gap-2 text-center">
        <div>
          <p class="text-xs text-gray-500">Active</p>
          <p class="text-sm font-bold text-green-600">
            {{ users.filter(u => u.user_type === 'ACTIVE').length }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Returning</p>
          <p class="text-sm font-bold text-blue-600">
            {{ users.filter(u => u.user_type === 'RETURNING').length }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-500">New</p>
          <p class="text-sm font-bold text-yellow-600">
            {{ users.filter(u => u.user_type === 'NEW').length }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
