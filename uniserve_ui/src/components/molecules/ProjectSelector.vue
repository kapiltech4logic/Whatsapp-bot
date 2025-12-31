<template>
  <div class="relative inline-block text-left">
    <button
      @click="isOpen = !isOpen"
      type="button"
      class="inline-flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
      :class="{ 'ring-2 ring-blue-500': isOpen }"
    >
      <div class="flex items-center gap-2">
        <FolderKanban class="w-4 h-4 text-gray-400" />
        <span class="truncate max-w-[150px]">{{ displayText }}</span>
      </div>
      <ChevronDown class="w-4 h-4 ml-2 text-gray-400 transition-transform" :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        v-click-outside="() => isOpen = false"
        class="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div class="p-2 max-h-80 overflow-y-auto">
          <!-- Loading State -->
          <div v-if="projectStore.loading" class="px-4 py-8 text-center text-gray-500">
            <Loader2 class="w-6 h-6 mx-auto animate-spin mb-2" />
            <p class="text-sm">Loading projects...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!projectStore.hasProjects" class="px-4 py-8 text-center text-gray-500">
            <FolderKanban class="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p class="text-sm">No projects found</p>
          </div>

          <!-- Project List -->
          <div v-else class="space-y-1">
            <button
              v-for="project in projectStore.activeProjects"
              :key="project._id"
              @click="selectProject(project)"
              class="w-full text-left px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors group"
              :class="{
                'bg-blue-50 text-blue-700': projectStore.currentProject?._id === project._id,
                'text-gray-700': projectStore.currentProject?._id !== project._id
              }"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <p class="font-medium truncate">{{ project.name }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {{ project.type }}
                    </span>
                    <span class="text-xs text-gray-500">{{ project.slug }}</span>
                  </div>
                </div>
                <CheckCircle2
                  v-if="projectStore.currentProject?._id === project._id"
                  class="w-5 h-5 text-blue-600 flex-shrink-0 ml-2"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { FolderKanban, ChevronDown, CheckCircle2, Loader2 } from 'lucide-vue-next';
import { useProjectStore } from '../../stores/organization';

const projectStore = useProjectStore();
const isOpen = ref(false);

const displayText = computed(() => projectStore.currentProjectName);

const selectProject = (project) => {
  projectStore.setCurrentProject(project);
  isOpen.value = false;
};

// Click outside directive
const clickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};

const vClickOutside = clickOutside;

onMounted(() => {
  projectStore.fetchProjects();
});
</script>
