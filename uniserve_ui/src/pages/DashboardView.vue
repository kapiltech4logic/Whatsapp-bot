<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useOrganizationStore } from "../stores/organization";
import {
  Building2,
  Search,
  RefreshCw,
  Plus,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  MessageSquare,
  Mail,
  Globe,
  FolderKanban,
  Users,
  BadgeCheck,
  Phone,
} from "lucide-vue-next";

// ✅ IMPORTANT: If your image is inside /public/whatsapp.png, DO NOT import it.
// Use: src="/whatsapp.png"
// Remove this import if you keep it in public:
// import whats from "../../public/whatsapp.png";

// Stores
const router = useRouter();
const authStore = useAuthStore();
const organizationStore = useOrganizationStore();

// State
const loading = ref(false);
const error = ref(null);
const searchQuery = ref("");

// Top filters
const serviceFilter = ref("All");
const statusFilter = ref("All");
const sortBy = ref("Recent");

// Dropdown open state
const openDropdown = ref(null); // "service" | "status" | "sort" | null
const toggleDropdown = async (key) => {
  openDropdown.value = openDropdown.value === key ? null : key;
  await nextTick();
};
const closeDropdown = () => (openDropdown.value = null);

const handleClickOutside = (e) => {
  const el = document.querySelector(".filtersWrap");
  if (el && !el.contains(e.target)) closeDropdown();
};
document.addEventListener("click", handleClickOutside);
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));

// Selection for right panel
const selectedOrgId = ref(null);
const selectedProjectId = ref(null);

// Fetch organizations
const fetchOrganizations = async () => {
  try {
    loading.value = true;
    error.value = null;
    await organizationStore.fetchOrganizations();
  } catch (err) {
    console.error("Error fetching organizations:", err);
    error.value = err?.message || "Failed to load organizations";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchOrganizations);

// Helpers
const safeLower = (v) => (v || "").toString().toLowerCase();
const formatNumber = (n) => new Intl.NumberFormat("en-IN").format(Number(n || 0));

// Field mapping
const getOrgStatus = (org) => org?.status || (org?.isActive === false ? "On hold" : "Active");
const getOrgProjectsCount = (org) =>
  Number(org?.projectsCount ?? org?.projectCount ?? org?.projects?.length ?? 0);
const getOrgUsersCount = (org) =>
  Number(org?.usersCount ?? org?.membersCount ?? org?.users?.length ?? 0);

// Services (optional)
const normalizeServices = (org) => {
  const s = org?.services;
  if (Array.isArray(s)) return s;
  if (typeof s === "string" && s.trim()) return [s];
  return [];
};

// Filtered + sorted
const filteredOrganizations = computed(() => {
  const list = organizationStore.organizations || [];

  const bySearch = list.filter((org) => {
    if (!searchQuery.value) return true;
    const q = safeLower(searchQuery.value);
    return safeLower(org?.name).includes(q) || safeLower(org?.description).includes(q);
  });

  const byStatus = bySearch.filter((org) => {
    if (statusFilter.value === "All") return true;
    return safeLower(getOrgStatus(org)) === safeLower(statusFilter.value);
  });

  const byService = byStatus.filter((org) => {
    if (serviceFilter.value === "All") return true;
    const services = normalizeServices(org).map((x) => safeLower(x));
    return services.some((x) => x.includes(safeLower(serviceFilter.value)));
  });

  const sorted = [...byService].sort((a, b) => {
    if (sortBy.value === "Name") return safeLower(a?.name).localeCompare(safeLower(b?.name));
    if (sortBy.value === "Projects") return getOrgProjectsCount(b) - getOrgProjectsCount(a);
    return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
  });

  return sorted;
});

const selectedOrg = computed(() => {
  const list = organizationStore.organizations || [];
  return list.find((o) => o?._id === selectedOrgId.value) || null;
});

// Right panel “projects”
const orgProjects = computed(() => (Array.isArray(selectedOrg.value?.projects) ? selectedOrg.value.projects : []));
const selectedProject = computed(() => {
  if (!orgProjects.value.length) return null;
  return orgProjects.value.find((p) => p?._id === selectedProjectId.value) || orgProjects.value[0];
});

// KPI values
const totalOrganizations = computed(() => (organizationStore.organizations || []).length);
const totalProjects = computed(() =>
  (organizationStore.organizations || []).reduce((sum, org) => sum + getOrgProjectsCount(org), 0)
);
const totalUsers = computed(() =>
  (organizationStore.organizations || []).reduce((sum, org) => sum + getOrgUsersCount(org), 0)
);
const activeOrganizations = computed(
  () => (organizationStore.organizations || []).filter((o) => safeLower(getOrgStatus(o)) === "active").length
);

// Actions
const handleRowClick = (org) => {
  selectedOrgId.value = org?._id;
  router.push(`/organizations/${org._id}/projects`);
};
const handleDownloadReport = () => console.log("Download report");
const handleNewOrganization = () => console.log("New organization");

// Badges
const statusBadgeClass = (status) => {
  if (status === "Active") return "bg-green-100 text-green-700";
  if (status === "Limited") return "bg-yellow-100 text-yellow-700";
  if (status === "On hold") return "bg-red-100 text-red-700";
  if (status === "TRIAL") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-700";
};

// Service icon mapping (optional)
const serviceIcon = (name) => {
  const n = safeLower(name);
  if (n.includes("sms")) return { icon: MessageSquare, cls: "bg-blue-500" };
  if (n.includes("mail") || n.includes("email")) return { icon: Mail, cls: "bg-sky-500" };
  if (n.includes("web") || n.includes("api")) return { icon: Globe, cls: "bg-indigo-500" };
  return { icon: Phone, cls: "bg-gray-400" };
};
</script>

<template>
  <div class="min-h-screen bg-[#F4F7FB]">
    <!-- TOP NAV -->
    <div class="bg-white border-b border-gray-200">
      <div class="px-6 h-16 flex items-center justify-end">
        <!-- Custom dropdowns -->
        <div class="hidden lg:flex items-center gap-3 filtersWrap">
          <!-- Service -->
          <div class="dropdownWrap">
            <button class="dropdownBtn" @click.stop="toggleDropdown('service')">
              <span class="dropdownLabel">Service:</span>
              <span class="dropdownValue">{{ serviceFilter }}</span>
              <ChevronDown
                :size="16"
                class="dropdownChevron"
                :class="{ 'rotate-180': openDropdown === 'service' }"
              />
            </button>

            <div v-if="openDropdown === 'service'" class="dropdownMenu">
              <button class="dropdownItem" @click="serviceFilter='All'; closeDropdown()">All</button>
              <button class="dropdownItem" @click="serviceFilter='WhatsApp'; closeDropdown()">WhatsApp</button>
              <button class="dropdownItem" @click="serviceFilter='SMS'; closeDropdown()">SMS</button>
              <button class="dropdownItem" @click="serviceFilter='Email'; closeDropdown()">Email</button>
            </div>
          </div>

          <!-- Status -->
          <div class="dropdownWrap">
            <button class="dropdownBtn" @click.stop="toggleDropdown('status')">
              <span class="dropdownLabel">Status:</span>
              <span class="dropdownValue">{{ statusFilter }}</span>
              <ChevronDown
                :size="16"
                class="dropdownChevron"
                :class="{ 'rotate-180': openDropdown === 'status' }"
              />
            </button>

            <div v-if="openDropdown === 'status'" class="dropdownMenu">
              <button class="dropdownItem" @click="statusFilter='All'; closeDropdown()">All</button>
              <button class="dropdownItem" @click="statusFilter='Active'; closeDropdown()">Active</button>
              <button class="dropdownItem" @click="statusFilter='Limited'; closeDropdown()">Limited</button>
              <button class="dropdownItem" @click="statusFilter='On hold'; closeDropdown()">On hold</button>
            </div>
          </div>

          <!-- Sort -->
          <div class="dropdownWrap">
            <button class="dropdownBtn" @click.stop="toggleDropdown('sort')">
              <span class="dropdownLabel">Sort by:</span>
              <span class="dropdownValue">{{ sortBy }}</span>
              <ChevronDown
                :size="16"
                class="dropdownChevron"
                :class="{ 'rotate-180': openDropdown === 'sort' }"
              />
            </button>

            <div v-if="openDropdown === 'sort'" class="dropdownMenu">
              <button class="dropdownItem" @click="sortBy='Recent'; closeDropdown()">Recent</button>
              <button class="dropdownItem" @click="sortBy='Name'; closeDropdown()">Name</button>
              <button class="dropdownItem" @click="sortBy='Projects'; closeDropdown()">Projects</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TITLE ROW -->
    <div class="px-6 pt-6 flex items-center justify-between">
      <h1 class="text-[26px] font-semibold text-gray-900">Customer Service Consumption</h1>

      <div class="flex items-center gap-3">
        <button
          v-if="authStore.isSuperAdmin"
          @click="handleNewOrganization"
          class="hidden xl:inline-flex cursor-pointer items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-sm transition"
        >
          <Plus :size="18" />
          New Organization
        </button>

        <button
          @click="handleDownloadReport"
          class="inline-flex items-center cursor-pointer gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Download :size="18" />
          Download Report
        </button>
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="px-6 mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <div class="kpiCard">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="kpiIcon bg-blue-50">
              <Users class="text-blue-600" :size="18" />
            </div>
            <div>
              <div class="kpiLabel">Total Customers</div>
              <div class="kpiValue">{{ formatNumber(totalOrganizations) }}</div>
              <div class="kpiDelta">
                <ArrowUpRight :size="14" class="text-green-600" />
                <span>+5.6% this month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="kpiCard">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="kpiIcon bg-blue-50">
              <FolderKanban class="text-blue-600" :size="18" />
            </div>
            <div>
              <div class="kpiLabel">Total Revenue</div>
              <div class="kpiValue">₹ {{ formatNumber(totalProjects * 1200) }}</div>
              <div class="kpiDelta">
                <ArrowUpRight :size="14" class="text-green-600" />
                <span>+6.2% this month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="kpiCard">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="kpiIcon bg-green-50">
              <BadgeCheck class="text-green-600" :size="18" />
            </div>
            <div>
              <div class="kpiLabel">Total Profit / Loss</div>
              <div class="kpiValue">₹ {{ formatNumber(activeOrganizations * 5400) }}</div>
              <div class="kpiDelta">
                <ArrowUpRight :size="14" class="text-green-600" />
                <span>+12.4%</span>
              </div>
            </div>
          </div>
          <svg class="w-24 h-10 opacity-70" viewBox="0 0 120 40" fill="none">
            <path
              d="M2 30 C20 26, 28 18, 40 20 C55 22, 62 10, 74 14 C88 18, 96 6, 118 8"
              stroke="currentColor"
              class="text-blue-400"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>

      <div class="kpiCard">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="kpiIcon bg-blue-50">
              <MessageSquare class="text-blue-600" :size="18" />
            </div>
            <div>
              <div class="kpiLabel">Total Messages Sent</div>
              <div class="kpiValue">{{ formatNumber(totalUsers * 2300) }}</div>
              <div class="kpiDelta">
                <ArrowUpRight :size="14" class="text-green-600" />
                <span>+7.2% this month</span>
              </div>
            </div>
          </div>
          <svg class="w-24 h-10 opacity-70" viewBox="0 0 120 40" fill="none">
            <path
              d="M2 28 C18 30, 30 22, 42 24 C56 26, 66 12, 78 16 C92 20, 104 10, 118 12"
              stroke="currentColor"
              class="text-blue-400"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- MAIN GRID -->
    <div class="px-6 mt-6 pb-10">
      <div v-if="loading && !organizationStore.organizations.length" class="py-16 flex items-center justify-center">
        <div class="text-center">
          <RefreshCw :size="44" class="animate-spin text-blue-500 mx-auto mb-3" />
          <p class="text-gray-600">Loading organizations...</p>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p class="text-red-600">{{ error }}</p>
        <button @click="fetchOrganizations" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
          Try Again
        </button>
      </div>

      <div v-else class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- LEFT TABLE -->
        <div class="xl:col-span-9">
          <div class="cardShell">
            <div class="px-4 py-3 border-b border-gray-100">
              <div class="relative max-w-xs">
                <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search"
                  class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-gray-500 border-b border-gray-100">
                    <th class="w-10 px-4 py-3 text-left">
                      <input type="checkbox" class="h-4 w-4 rounded border-gray-300" />
                    </th>

                    <th class="px-4 py-3 text-left font-medium">
                      <div class="inline-flex items-center gap-1">
                        Customer <ChevronDown :size="14" class="text-gray-400" />
                      </div>
                    </th>

                    <th class="px-4 py-3 text-left font-medium">
                      <div class="inline-flex items-center gap-1">
                        Services <ChevronDown :size="14" class="text-gray-400" />
                      </div>
                    </th>

                    <th class="px-4 py-3 text-left font-medium">
                      <div class="inline-flex items-center gap-1">
                        Revenue <ChevronDown :size="14" class="text-gray-400" />
                      </div>
                    </th>

                    <th class="px-4 py-3 text-left font-medium">
                      <div class="inline-flex items-center gap-1">
                        Profit / Loss <ChevronDown :size="14" class="text-gray-400" />
                      </div>
                    </th>

                    <th class="px-4 py-3 text-left font-medium">
                      <div class="inline-flex items-center gap-1">
                        Projects <ChevronDown :size="14" class="text-gray-400" />
                      </div>
                    </th>

                    <th class="px-4 py-3 text-left font-medium">
                      <div class="inline-flex items-center gap-1">
                        Status <ChevronDown :size="14" class="text-gray-400" />
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="org in filteredOrganizations"
                    :key="org._id"
                    class="border-b border-gray-50 hover:bg-gray-50/70 cursor-pointer transition"
                    @click="handleRowClick(org)"
                  >
                    <td class="px-4 py-3" @click.stop>
                      <input type="checkbox" class="h-4 w-4 rounded border-gray-300" />
                    </td>

                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Building2 class="text-blue-600" :size="16" />
                        </div>
                        <div class="min-w-0">
                          <div class="font-semibold text-gray-900 truncate">{{ org.name }}</div>
                          <div class="text-xs text-gray-400 truncate">{{ org.description || "—" }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- SERVICES: WhatsApp always -->
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="h-8 w-8 rounded-lg flex items-center justify-center bg-white ring-1 ring-black/5 shadow-sm" title="WhatsApp">
                          <img src="/whatsapp.png" alt="WhatsApp" class="h-5 w-5 object-contain" />
                        </div>

                        <span
                          v-if="normalizeServices(org).some((s) => safeLower(s).includes('dlt'))"
                          class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700"
                        >
                          Airtel DLT
                        </span>

                        <template
                          v-for="(srv, idx) in normalizeServices(org).filter((s) => !safeLower(s).includes('dlt')).slice(0, 2)"
                          :key="idx"
                        >
                          <div
                            class="h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-sm ring-1 ring-black/5"
                            :class="serviceIcon(srv).cls"
                            :title="srv"
                          >
                            <component :is="serviceIcon(srv).icon" :size="16" />
                          </div>
                        </template>
                      </div>
                    </td>

                    <td class="px-4 py-3 text-gray-700">—</td>
                    <td class="px-4 py-3 text-gray-700">—</td>
                    <td class="px-4 py-3 text-gray-700">—</td>

                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-semibold"
                        :class="statusBadgeClass(getOrgStatus(org))"
                      >
                        {{ getOrgStatus(org) }}
                      </span>
                    </td>
                  </tr>

                  <tr v-if="filteredOrganizations.length === 0">
                    <td colspan="7" class="px-6 py-10 text-center text-gray-500">No organizations found.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="px-4 py-3 text-xs text-gray-500 border-t border-gray-100 flex items-center justify-between">
              <div>Showing 1 - {{ Math.min(filteredOrganizations.length, 6) }} of {{ totalOrganizations }}</div>

              <div class="flex items-center gap-2">
                <button class="pagerBtn"><ChevronLeft :size="16" /></button>
                <button class="pagerBtn">1</button>
                <button class="pagerBtn bg-gray-100">2</button>
                <button class="pagerBtn">3</button>
                <button class="pagerBtn"><ChevronRight :size="16" /></button>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL -->
        <div class="xl:col-span-3 space-y-4">
          <div class="cardShell">
            <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div class="font-semibold text-gray-900">Projects</div>
              <ChevronDown :size="16" class="text-gray-400" />
            </div>

            <div class="px-4 pt-3 pb-2">
              <div class="grid grid-cols-3 text-xs text-gray-500 font-medium">
                <div>Messages</div>
                <div>Cost</div>
                <div>Profit / Loss</div>
              </div>
            </div>

            <div class="px-4 pb-4 space-y-3">
              <template v-if="selectedOrg">
                <div class="grid grid-cols-3 items-center text-sm">
                  <div class="flex items-center gap-2 text-gray-700">
                    <div class="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <MessageSquare class="text-blue-600" :size="16" />
                    </div>
                    <span class="text-gray-600">{{ selectedProject?.messages ?? "—" }}</span>
                  </div>
                  <div class="text-gray-600">₹ {{ selectedProject?.cost ?? "—" }}</div>
                  <div class="text-gray-600">₹ {{ selectedProject?.profit ?? "—" }}</div>
                </div>
              </template>

              <template v-else>
                <div class="text-sm text-gray-500">Select an organization to view project details.</div>
              </template>

              <button
                class="w-full mt-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-semibold transition"
                :disabled="!selectedOrg"
                @click="selectedOrg && router.push(`/organizations/${selectedOrg._id}/projects`)"
              >
                View ALL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Professional + premium feel */
.cardShell {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(16, 24, 40, 0.06);
  overflow: hidden;
  backdrop-filter: blur(6px);
}

.kpiCard {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.9));
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 14px 40px rgba(16, 24, 40, 0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.kpiCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 60px rgba(16, 24, 40, 0.08);
}

.kpiIcon {
  height: 44px;
  width: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(229, 231, 235, 0.85);
  box-shadow: 0 10px 24px rgba(16, 24, 40, 0.06);
}

.kpiLabel {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}
.kpiValue {
  font-size: 28px;
  line-height: 1.1;
  font-weight: 750;
  color: #0f172a;
  margin-top: 6px;
}
.kpiDelta {
  margin-top: 8px;
  font-size: 12px;
  color: #16a34a;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 650;
}

/* Table polish */
table {
  border-collapse: separate;
  border-spacing: 0;
}
thead tr {
  background: #f8fafc;
}
thead th {
  font-size: 12px;
  letter-spacing: 0.02em;
}
tbody tr {
  transition: background 0.15s ease;
}
tbody tr:hover {
  background: rgba(15, 23, 42, 0.03);
}

/* Pagination */
.pagerBtn {
  height: 32px;
  min-width: 32px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(229, 231, 235, 0.9);
  background: white;
  color: #64748b;
  font-weight: 650;
  transition: background 0.15s ease, transform 0.15s ease;
}
.pagerBtn:hover {
  background: #f8fafc;
  transform: translateY(-1px);
}

/* ✅ Custom dropdown */
.dropdownWrap {
  position: relative;
}

.dropdownBtn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(229, 231, 235, 0.9);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  transition: all 0.18s ease;
  cursor: pointer;
}
.dropdownBtn:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.09);
}

.dropdownLabel {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.dropdownValue {
  font-size: 13px;
  color: #0f172a;
  font-weight: 700;
}

.dropdownChevron {
  color: #94a3b8;
  transition: transform 0.18s ease;
}

.dropdownMenu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 210px;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.9);
  /* box-shadow: 0 22px 60px rgba(15, 23, 42, 0.14); */
  padding: 8px;
  z-index: 50;
  animation: dropIn 0.15s ease;
}

@keyframes dropIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdownItem {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  background: transparent;
  transition: background 0.15s ease;
}
.dropdownItem:hover {
  background: #f1f5f9;
}
</style>
