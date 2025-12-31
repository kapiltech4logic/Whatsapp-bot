<script setup>
import { useSlots } from 'vue';

const slots = useSlots();
</script>

<template>
  <div class="h-screen flex overflow-hidden bg-gray-100">
    <!-- Left Sidebar (Master) -->
    <aside class="w-1/3 max-w-md flex flex-col bg-white shadow-lg">
      <slot name="sidebar">
        <!-- Default sidebar content -->
      </slot>
    </aside>
    
    <!-- Right Content Area (Detail) -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <slot name="content">
        <!-- Default main content -->
      </slot>
    </main>
  </div>
</template>
