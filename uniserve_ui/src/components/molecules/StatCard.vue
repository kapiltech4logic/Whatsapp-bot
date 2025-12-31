<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: Object,
    required: true
  },
  trend: {
    type: Object,
    default: null
  },
  color: {
    type: String,
    default: 'blue'
  }
});

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
  green: 'from-green-500 to-green-600 shadow-green-500/20',
  purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
  amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
  rose: 'from-rose-500 to-rose-600 shadow-rose-500/20',
  cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-500/20'
};
</script>

<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 mb-2">{{ title }}</p>
        <p class="text-3xl font-bold text-gray-900">{{ value }}</p>
        
        <div v-if="trend" class="flex items-center mt-2 text-sm">
          <span 
            :class="trend.direction === 'up' ? 'text-green-600' : 'text-red-600'"
            class="font-medium"
          >
            {{ trend.direction === 'up' ? '↑' : '↓' }} {{ trend.value }}
          </span>
          <span class="text-gray-500 ml-1">{{ trend.label }}</span>
        </div>
      </div>
      
      <div 
        :class="['p-3 rounded-lg bg-gradient-to-br shadow-lg', colorClasses[color]]"
      >
        <component :is="icon" :size="24" class="text-white" />
      </div>
    </div>
  </div>
</template>
