<script setup>
import { computed } from 'vue';
import { Clock } from 'lucide-vue-next';

const props = defineProps({
  timestamp: {
    type: [String, Date, Number],
    required: true
  },
  format: {
    type: String,
    default: 'relative', // 'relative' or 'absolute'
    validator: (value) => ['relative', 'absolute', 'both'].includes(value)
  },
  showIcon: {
    type: Boolean,
    default: false
  }
});

const formatRelativeTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

const formatAbsoluteTime = (timestamp) => {
  const date = new Date(timestamp);
  const options = { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  };
  return date.toLocaleDateString('en-US', options);
};

const displayTime = computed(() => {
  if (props.format === 'relative') {
    return formatRelativeTime(props.timestamp);
  } else if (props.format === 'absolute') {
    return formatAbsoluteTime(props.timestamp);
  } else {
    return `${formatRelativeTime(props.timestamp)} • ${formatAbsoluteTime(props.timestamp)}`;
  }
});
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-sm text-gray-600">
    <Clock v-if="showIcon" :size="14" class="text-gray-400" />
    {{ displayTime }}
  </span>
</template>
