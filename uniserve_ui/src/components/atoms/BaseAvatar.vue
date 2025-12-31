<script setup>
import { computed } from 'vue';
import { User } from 'lucide-vue-next';

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  }
});

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg'
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
};

const initials = computed(() => {
  if (!props.name) return '';
  const names = props.name.trim().split(' ');
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase();
  }
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
});

const backgroundColor = computed(() => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500'
  ];
  const charCode = props.name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
});
</script>

<template>
  <div 
    :class="[
      'rounded-full flex items-center justify-center font-semibold text-white',
      sizeClasses[size],
      initials ? backgroundColor : 'bg-gray-400'
    ]"
  >
    <span v-if="initials">{{ initials }}</span>
    <User v-else :size="iconSizes[size]" />
  </div>
</template>
