<script setup>
import { computed } from 'vue';
import BaseAvatar from '../atoms/BaseAvatar.vue';
import StatusBadge from '../atoms/StatusBadge.vue';
import TimeLabel from '../atoms/TimeLabel.vue';

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const displayName = computed(() => {
  return props.user.name || formatPhoneNumber(props.user.phone_number);
});

const formatPhoneNumber = (phone) => {
  if (!phone) return 'Unknown';
  // Format +919876543210 to +91 987...
  if (phone.length > 10) {
    return `${phone.substring(0, 3)} ${phone.substring(3, 6)}...`;
  }
  return phone;
};

const handleClick = () => {
  emit('click', props.user);
};
</script>

<template>
  <div 
    :class="[
      'flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 border-l-4',
      isSelected 
        ? 'bg-blue-50 border-l-blue-500 shadow-sm' 
        : 'bg-white border-l-transparent hover:bg-gray-50'
    ]"
    @click="handleClick"
  >
    <!-- Avatar -->
    <BaseAvatar :name="user.name" size="md" />
    
    <!-- User Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2 mb-1">
        <h3 :class="['font-semibold text-sm truncate', isSelected ? 'text-blue-900' : 'text-gray-900']">
          {{ displayName }}
        </h3>
      </div>
      
      <div class="flex items-center gap-2">
        <TimeLabel 
          :timestamp="user.last_active" 
          format="relative"
          class="text-xs"
        />
        <span v-if="user.language" class="text-xs text-gray-400">
          • {{ user.language.toUpperCase() }}
        </span>
      </div>
    </div>
    
    <!-- Status Badge -->
    <StatusBadge :status="user.user_type" />
  </div>
</template>
