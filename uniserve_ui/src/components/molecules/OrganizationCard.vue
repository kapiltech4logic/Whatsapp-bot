<script setup>
import { Building2, Users, FolderKanban, TrendingUp } from 'lucide-vue-next';

const props = defineProps({
  organization: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click', props.organization);
};

const getColorClass = (index) => {
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
</script>

<template>
  <div 
    @click="handleClick"
    class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden group"
  >
    <!-- Header with gradient -->
    <div :class="['p-6 bg-gradient-to-br', getColorClass(organization._id.length)]">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
            <Building2 :size="28" class="text-white" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">{{ organization.name }}</h3>
            <p v-if="organization.industry" class="text-white/80 text-sm mt-1">{{ organization.industry }}</p>
          </div>
        </div>
        <div class="opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <TrendingUp :size="20" class="text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <p v-if="organization.description" class="text-gray-600 text-sm mb-4 line-clamp-2">
        {{ organization.description }}
      </p>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-blue-50 rounded-lg">
            <FolderKanban :size="18" class="text-blue-600" />
          </div>
          <div>
            <p class="text-xs text-gray-500">Projects</p>
            <p class="text-lg font-bold text-gray-900">{{ organization.projectCount || 0 }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="p-2 bg-green-50 rounded-lg">
            <Users :size="18" class="text-green-600" />
          </div>
          <div>
            <p class="text-xs text-gray-500">Users</p>
            <p class="text-lg font-bold text-gray-900">{{ organization.userCount || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div :class="['w-2 h-2 rounded-full', organization.isActive ? 'bg-green-500' : 'bg-gray-300']"></div>
          <span class="text-xs text-gray-500">{{ organization.isActive ? 'Active' : 'Inactive' }}</span>
        </div>
        <span class="text-xs text-blue-600 font-medium group-hover:underline">
          View Projects →
        </span>
      </div>
    </div>
  </div>
</template>
