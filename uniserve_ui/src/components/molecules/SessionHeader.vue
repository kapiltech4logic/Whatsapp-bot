<script setup>
import { computed } from 'vue';
import TimeLabel from '../atoms/TimeLabel.vue';
import { Calendar, MapPin, Clock } from 'lucide-vue-next';

const props = defineProps({
  session: {
    type: Object,
    required: true
  }
});

const sourceConfig = computed(() => {
  const configs = {
    QR_CODE: { label: 'QR Code', color: 'bg-purple-100 text-purple-800', icon: 'QR' },
    DIRECT_LINK: { label: 'Direct Link', color: 'bg-blue-100 text-blue-800', icon: 'Link' },
    AD_CLICK: { label: 'Ad Click', color: 'bg-green-100 text-green-800', icon: 'Target' },
    REFERRAL: { label: 'Referral', color: 'bg-pink-100 text-pink-800', icon: 'Users' },
    ORGANIC: { label: 'Organic', color: 'bg-gray-100 text-gray-800', icon: 'Hash' }
  };
  return configs[props.session.source] || configs.ORGANIC;
});

const formattedDuration = computed(() => {
  if (!props.session.duration_seconds) return 'Active';
  const minutes = Math.floor(props.session.duration_seconds / 60);
  const seconds = props.session.duration_seconds % 60;
  return `${minutes}m ${seconds}s`;
});
</script>

<template>
  <div class="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
    <!-- Date & Time -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <Calendar :size="16" class="text-gray-400" />
        <TimeLabel 
          :timestamp="session.start_time" 
          format="absolute"
          class="font-medium text-gray-700"
        />
      </div>
    </div>
    
    <!-- Source Badge -->
    <div class="flex items-center gap-3">
      <span :class="['px-3 py-1 rounded-full text-xs font-medium', sourceConfig.color]">
        <MapPin :size="12" class="inline mr-1" />
        {{ sourceConfig.label }}
      </span>
      
      <!-- Duration -->
      <div class="flex items-center gap-1.5 text-sm text-gray-600">
        <Clock :size="14" class="text-gray-400" />
        <span class="font-mono">{{ formattedDuration }}</span>
      </div>
    </div>
  </div>
</template>
