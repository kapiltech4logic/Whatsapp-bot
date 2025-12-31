<script setup>
import { ref } from 'vue';
import StepNode from '../atoms/StepNode.vue';
import { Info } from 'lucide-vue-next';

const props = defineProps({
  flow: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isLast: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['show-details']);

const showTooltip = ref(false);

const handleClick = () => {
  emit('show-details', props.flow);
};

const formatStepLabel = (step) => {
  return step.replace(/_/g, ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
</script>

<template>
  <div class="flex flex-col items-center relative group">
    <!-- Step Node -->
    <div 
      class="relative"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
    >
      <StepNode 
        :label="flow.flow_step"
        :isActive="isActive"
        :isCompleted="!isActive"
        :isLast="isLast"
        @click="handleClick"
      />
      
      <!-- Info Icon Overlay on Hover -->
      <div 
        v-if="flow.step_data"
        class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div class="bg-blue-500 rounded-full p-0.5">
          <Info :size="10" class="text-white" />
        </div>
      </div>
    </div>
    
    <!-- Step Label -->
    <div class="mt-2 text-center">
      <p :class="['text-xs font-medium whitespace-nowrap', isActive ? 'text-blue-600' : 'text-gray-700']">
        {{ formatStepLabel(flow.flow_step) }}
      </p>
      <p v-if="flow.step_timestamp" class="text-xs text-gray-400 mt-0.5">
        {{ new Date(flow.step_timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }}
      </p>
    </div>
    
    <!-- Tooltip with Step Data -->
    <div 
      v-if="showTooltip && flow.step_data"
      class="absolute top-full mt-2 z-10 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl w-64 animate-fade-in"
    >
      <div class="font-semibold mb-2 border-b border-gray-700 pb-1">Step Data</div>
      <pre class="whitespace-pre-wrap break-words font-mono text-xs">{{ JSON.stringify(flow.step_data, null, 2) }}</pre>
      <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>
