<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['NEW', 'RETURNING', 'ACTIVE', 'INACTIVE'].includes(value)
  }
});

const badgeConfig = computed(() => {
  const configs = {
    ACTIVE: {
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      dotClass: 'bg-green-500',
      label: 'Active'
    },
    RETURNING: {
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-800',
      dotClass: 'bg-blue-500',
      label: 'Returning'
    },
    NEW: {
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800',
      dotClass: 'bg-yellow-500',
      label: 'New'
    },
    INACTIVE: {
      bgClass: 'bg-gray-100',
      textClass: 'text-gray-800',
      dotClass: 'bg-gray-500',
      label: 'Inactive'
    }
  };
  return configs[props.status] || configs.NEW;
});
</script>

<template>
  <span 
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      badgeConfig.bgClass,
      badgeConfig.textClass
    ]"
  >
    <span :class="['w-1.5 h-1.5 rounded-full', badgeConfig.dotClass]"></span>
    {{ badgeConfig.label }}
  </span>
</template>
