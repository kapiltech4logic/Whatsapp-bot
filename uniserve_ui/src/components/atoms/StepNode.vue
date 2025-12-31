<script setup>
import { computed } from 'vue';
import { Check } from 'lucide-vue-next';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: true
  },
  isLast: {
    type: Boolean,
    default: false
  }
});

const nodeClasses = computed(() => {
  if (props.isActive) {
    return 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200';
  }
  if (props.isCompleted) {
    return 'bg-green-500 border-green-500 text-white';
  }
  return 'bg-white border-gray-300 text-gray-500';
});
</script>

<template>
  <div class="flex items-center">
    <div class="relative flex flex-col items-center">
      <button
        :class="[
          'w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold transition-all duration-200 hover:scale-110 cursor-pointer',
          nodeClasses
        ]"
      >
        <Check v-if="isCompleted && !isActive" :size="20" />
        <span v-else-if="!isCompleted" class="text-xs">•</span>
      </button>
    </div>
  </div>
</template>
