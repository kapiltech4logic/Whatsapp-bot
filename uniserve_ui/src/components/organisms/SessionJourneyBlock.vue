<script setup>
import { computed, ref } from 'vue';
import SessionHeader from '../molecules/SessionHeader.vue';
import FlowStep from '../molecules/FlowStep.vue';
import { ArrowRight, Zap } from 'lucide-vue-next';

const props = defineProps({
  session: {
    type: Object,
    required: true
  },
  flows: {
    type: Array,
    required: true,
    default: () => []
  }
});

const selectedFlow = ref(null);

const sortedFlows = computed(() => {
  return [...props.flows]
    .filter(flow => flow.session_id === props.session.id)
    .sort((a, b) => a.step_order - b.step_order);
});

const handleShowDetails = (flow) => {
  selectedFlow.value = selectedFlow.value?.id === flow.id ? null : flow;
};
</script>

<template>
  <div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
    <!-- Session Header -->
    <SessionHeader :session="session" />
    
    <!-- Flow Steps Visualization -->
    <div class="p-6 bg-gradient-to-br from-white to-gray-50">
      <div v-if="sortedFlows.length === 0" class="text-center py-8 text-gray-400">
        <Zap :size="32" class="mx-auto mb-2 opacity-50" />
        <p class="text-sm">No journey steps recorded</p>
      </div>
      
      <div v-else class="relative">
        <!-- Metro Map Line Container -->
        <div class="flex items-start gap-4 overflow-x-auto pb-4">
          <template v-for="(flow, index) in sortedFlows" :key="flow.id">
            <!-- Flow Step -->
            <FlowStep
              :flow="flow"
              :isActive="index === sortedFlows.length - 1"
              :isLast="index === sortedFlows.length - 1"
              @show-details="handleShowDetails"
            />
            
            <!-- Connector Arrow (except for last item) -->
            <div 
              v-if="index < sortedFlows.length - 1"
              class="flex items-center pt-5"
            >
              <div class="flex items-center gap-1">
                <div class="h-0.5 w-12 bg-gradient-to-r from-blue-400 to-blue-300"></div>
                <ArrowRight :size="16" class="text-blue-400" />
              </div>
            </div>
          </template>
        </div>
        
        <!-- Step Details Panel -->
        <div 
          v-if="selectedFlow"
          class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="font-semibold text-blue-900 mb-1">
                {{ selectedFlow.flow_step.replace(/_/g, ' ') }}
              </h4>
              <p class="text-xs text-blue-600">
                Step {{ selectedFlow.step_order }} • 
                {{ new Date(selectedFlow.step_timestamp).toLocaleString() }}
              </p>
            </div>
            <button 
              @click="selectedFlow = null"
              class="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div class="bg-white rounded-md p-3 border border-blue-100">
            <p class="text-xs font-semibold text-gray-700 mb-2">Step Data:</p>
            <pre class="text-xs text-gray-600 whitespace-pre-wrap break-words font-mono">{{ JSON.stringify(selectedFlow.step_data, null, 2) }}</pre>
          </div>
        </div>
      </div>
      
      <!-- Journey Stats -->
      <div class="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span>{{ sortedFlows.length }} steps in journey</span>
        <span v-if="sortedFlows.length > 0">
          {{ Math.ceil((new Date(sortedFlows[sortedFlows.length - 1].step_timestamp) - new Date(sortedFlows[0].step_timestamp)) / 1000) }}s total
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for horizontal flow */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
