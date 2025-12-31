<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { Download, Plus } from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();

// Filters
const activeFilter = ref("all");

// ✅ Same sample data from your HTML
const customers = ref([
  {
    name: "RetailX Solutions",
    services: ["whatsapp", "sms"],
    projects: 8,
    usage: "1.2M msgs",
    revenue: "₹2.4L",
    profit: 45200,
    status: "active",
  },
  {
    name: "FinTech Global",
    services: ["whatsapp"],
    projects: 5,
    usage: "850K msgs",
    revenue: "₹1.8L",
    profit: 38500,
    status: "active",
  },
  {
    name: "EduLearn India",
    services: ["sms"],
    projects: 12,
    usage: "2.1M msgs",
    revenue: "₹1.6L",
    profit: -15000,
    status: "active",
  },
  {
    name: "HealthCare Plus",
    services: ["whatsapp", "sms"],
    projects: 6,
    usage: "950K msgs",
    revenue: "₹2.1L",
    profit: 52000,
    status: "active",
  },
  {
    name: "LogiTrack Systems",
    services: ["whatsapp"],
    projects: 3,
    usage: "420K msgs",
    revenue: "₹95K",
    profit: 28000,
    status: "active",
  },
  {
    name: "FoodDelivery Hub",
    services: ["sms"],
    projects: 15,
    usage: "3.2M msgs",
    revenue: "₹2.8L",
    profit: -25000,
    status: "active",
  },
  {
    name: "TravelBuddy Co",
    services: ["whatsapp", "sms"],
    projects: 4,
    usage: "680K msgs",
    revenue: "₹1.3L",
    profit: 35000,
    status: "active",
  },
  {
    name: "RealEstate Pro",
    services: ["whatsapp"],
    projects: 7,
    usage: "1.1M msgs",
    revenue: "₹2.0L",
    profit: 48000,
    status: "active",
  },
]);

const projects = ref([
  {
    customer: "RetailX Solutions",
    name: "Customer Support Bot",
    service: "whatsapp",
    messages: "450K",
    revenue: "₹95K",
    cost: "₹68K",
    profit: 27000,
    status: "active",
  },
  {
    customer: "RetailX Solutions",
    name: "Order Notifications",
    service: "sms",
    messages: "320K",
    revenue: "₹42K",
    cost: "₹38K",
    profit: 4000,
    status: "active",
  },
  {
    customer: "FinTech Global",
    name: "Transaction Alerts",
    service: "whatsapp",
    messages: "850K",
    revenue: "₹1.8L",
    cost: "₹1.4L",
    profit: 38500,
    status: "active",
  },
  {
    customer: "EduLearn India",
    name: "Admission Updates",
    service: "sms",
    messages: "1.2M",
    revenue: "₹95K",
    cost: "₹1.1L",
    profit: -15000,
    status: "active",
  },
  {
    customer: "HealthCare Plus",
    name: "Appointment Reminders",
    service: "whatsapp",
    messages: "580K",
    revenue: "₹1.2L",
    cost: "₹85K",
    profit: 35000,
    status: "active",
  },
  {
    customer: "HealthCare Plus",
    name: "Test Results",
    service: "sms",
    messages: "370K",
    revenue: "₹48K",
    cost: "₹31K",
    profit: 17000,
    status: "active",
  },
]);

// Computed filters (same logic as HTML)
const filteredCustomers = computed(() => {
  if (activeFilter.value === "whatsapp") {
    return customers.value.filter((c) => c.services.includes("whatsapp"));
  }
  if (activeFilter.value === "sms") {
    return customers.value.filter((c) => c.services.includes("sms"));
  }
  if (activeFilter.value === "both") {
    return customers.value.filter((c) => c.services.length === 2);
  }
  return customers.value;
});

// KPI values
const whatsappCustomers = computed(
  () => customers.value.filter((c) => c.services.includes("whatsapp")).length
);
const smsCustomers = computed(
  () => customers.value.filter((c) => c.services.includes("sms")).length
);
const activeProjects = computed(() => customers.value.reduce((sum, c) => sum + (c.projects || 0), 0));

const formatNumber = (n) => new Intl.NumberFormat("en-IN").format(Number(n || 0));

const viewCustomer = (customerName) => {
  // Keep the same behavior as HTML (alert)
  alert(
    `Viewing detailed dashboard for: ${customerName}\n\nThis would open a detailed view with:\n- All active projects\n- Usage analytics\n- Billing history\n- Performance metrics`
  );

  // OR if you want routing later:
  // router.push(`/customers/${encodeURIComponent(customerName)}`);
};

const handleDownloadReport = () => console.log("Download report");
const handleNewOrganization = () => router.push("/organizations/new");
</script>

<template>
  <!-- ✅ same page structure like your Vue pages -->
  <div  class="dashboardScroll" >
    <!-- Header row (kept HTML look, added optional actions like your reference) -->
    <div class="header">
      <div class="headerTop">
        <div>
          <h1>🚀 Tech4logic Service Provider Dashboard</h1>
          <p>Meta TSP Partner (WhatsApp) | Airtel DLT Services Provider</p>
        </div>

        <div class="headerActions">
          <button
            v-if="authStore?.isSuperAdmin"
            class="topBtn primary"
            @click="handleNewOrganization"
          >
            <Plus :size="16" />
            New Organization
          </button>

          <button class="topBtn" @click="handleDownloadReport">
            <Download :size="16" />
            Download Report
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">

      <div class="stat-card">
        <div class="stat-icon whatsapp">💬</div>
        <div class="stat-label">Total WhatsApp Customers</div>
        <div class="stat-value">{{ whatsappCustomers }}</div>
        <div class="stat-change positive">↑ 12 this month</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon sms">📱</div>
        <div class="stat-label">Total SMS Customers (Airtel DLT)</div>
        <div class="stat-value">{{ smsCustomers }}</div>
        <div class="stat-change positive">↑ 8 this month</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon profit">💰</div>
        <div class="stat-label">Total Monthly Revenue</div>
        <div class="stat-value">₹18.4L</div>
        <div class="stat-change positive">↑ 15.3%</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon profit">📊</div>
        <div class="stat-label">Active Projects</div>
        <div class="stat-value">{{ activeProjects }}</div>
        <div class="stat-change positive">↑ 23 new</div>
      </div>
    </div>

    <!-- Customer Overview -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2 class="section-title">Customer Overview</h2>

        <div class="filter-group">
          <button class="filter-btn" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">
            All
          </button>
          <button
            class="filter-btn"
            :class="{ active: activeFilter === 'whatsapp' }"
            @click="activeFilter = 'whatsapp'"
          >
            WhatsApp
          </button>
          <button class="filter-btn" :class="{ active: activeFilter === 'sms' }" @click="activeFilter = 'sms'">
            SMS
          </button>
          <button class="filter-btn" :class="{ active: activeFilter === 'both' }" @click="activeFilter = 'both'">
            Both Services
          </button>
        </div>
      </div>

      <table class="customer-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Services</th>
            <th>Active Projects</th>
            <th>Monthly Usage</th>
            <th>Revenue</th>
            <th>Profit/Loss</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
            
          <tr v-for="customer in filteredCustomers" :key="customer.name">

            <td><strong>{{ customer.name }}</strong></td>

            <td>
              <span
                v-for="service in customer.services"
                :key="service"
                class="service-badge"
                :class="service"
              >
                {{ service === "whatsapp" ? "WhatsApp" : "Airtel SMS" }}
              </span>
            </td>

            <td>{{ customer.projects }}</td>
            <td>{{ customer.usage }}</td>
            <td><strong>{{ customer.revenue }}</strong></td>

            <td :class="customer.profit >= 0 ? 'profit-positive' : 'profit-negative'">
              {{ customer.profit >= 0 ? "+" : "" }}₹{{ formatNumber(Math.abs(customer.profit)) }}
            </td>

            <td>
              <span class="project-status" :class="customer.status">
                {{ customer.status.toUpperCase() }}
              </span>
            </td>

            <td>
              <button class="action-btn view" @click="viewCustomer(customer.name)">View Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Projects -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2 class="section-title">Project-wise Profit & Loss Analysis</h2>
      </div>

      <div>
        <div v-for="project in projects" :key="project.customer + project.name" class="project-card">
          <div class="project-header">
            <div>
              <div class="project-name">{{ project.name }}</div>
              <div class="project-sub">{{ project.customer }}</div>
            </div>

            <span class="project-status" :class="project.status">
              {{ project.status.toUpperCase() }}
            </span>
          </div>

          <div class="project-metrics">
            <div class="metric-item">
              <div class="metric-label">Service</div>
              <div class="metric-value">
                <span class="service-badge" :class="project.service">
                  {{ project.service === "whatsapp" ? "WhatsApp" : "SMS" }}
                </span>
              </div>
            </div>

            <div class="metric-item">
              <div class="metric-label">Messages</div>
              <div class="metric-value">{{ project.messages }}</div>
            </div>

            <div class="metric-item">
              <div class="metric-label">Revenue</div>
              <div class="metric-value">{{ project.revenue }}</div>
            </div>

            <div class="metric-item">
              <div class="metric-label">Cost</div>
              <div class="metric-value">{{ project.cost }}</div>
            </div>

            <div class="metric-item">
              <div class="metric-label">Profit/Loss</div>
              <div class="metric-value" :class="project.profit >= 0 ? 'profit-positive' : 'profit-negative'">
                {{ project.profit >= 0 ? "+" : "" }}₹{{ formatNumber(Math.abs(project.profit)) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2 class="section-title">Service Usage Summary</h2>
      </div>

      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-value">8.4M</div>
          <div class="summary-label">WhatsApp Messages (Month)</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">12.7M</div>
          <div class="summary-label">SMS Sent (Month)</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">₹12.8L</div>
          <div class="summary-label">Total Profit</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">₹2.3L</div>
          <div class="summary-label">Total Loss</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

/* ✅ SAME CSS AS YOUR HTML (only tiny additions for header actions) */

.dashboardScroll {
  height: 95vh;              /* take full viewport */
  overflow-y: auto;           /* enable vertical scroll */
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: #f5f7fa;
  padding: 20px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.headerTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.header h1 {
  font-size: 2em;
  margin-bottom: 5px;
}

.header p {
  opacity: 0.9;
  font-size: 1.1em;
}

.headerActions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.topBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.12);
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 0.9em;
}
.topBtn:hover {
  background: rgba(255, 255, 255, 0.2);
}
.topBtn.primary {
  background: rgba(255, 255, 255, 0.22);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 15px;
}
.stat-icon.whatsapp {
  background: #dcf8c6;
}
.stat-icon.sms {
  background: #e3f2fd;
}
.stat-icon.profit {
  background: #c8e6c9;
}
.stat-icon.loss {
  background: #ffcdd2;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 5px;
}
.stat-value {
  font-size: 2em;
  font-weight: bold;
  color: #333;
}
.stat-change {
  font-size: 0.85em;
  margin-top: 5px;
}
.stat-change.positive {
  color: #4caf50;
}
.stat-change.negative {
  color: #f44336;
}

.dashboard-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}
.section-title {
  font-size: 1.5em;
  color: #333;
  font-weight: 600;
}

.filter-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}
.filter-btn:hover,
.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.customer-table {
  width: 100%;
  border-collapse: collapse;
}
.customer-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e0e0e0;
}
.customer-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.customer-table tr:hover {
  background: #f8f9ff;
}

.service-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
  margin: 2px;
}
.service-badge.whatsapp {
  background: #dcf8c6;
  color: #075e54;
}
.service-badge.sms {
  background: #e3f2fd;
  color: #1565c0;
}

.profit-positive {
  color: #4caf50;
  font-weight: 600;
}
.profit-negative {
  color: #f44336;
  font-weight: 600;
}

.project-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 4px solid #667eea;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.project-name {
  font-weight: 600;
  color: #333;
  font-size: 1.1em;
}
.project-sub {
  color: #666;
  font-size: 0.9em;
  margin-top: 3px;
}

.project-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 500;
}
.project-status.active {
  background: #c8e6c9;
  color: #2e7d32;
}
.project-status.inactive {
  background: #ffcdd2;
  color: #c62828;
}

.project-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.metric-item {
  display: flex;
  flex-direction: column;
}
.metric-label {
  font-size: 0.85em;
  color: #666;
  margin-bottom: 3px;
}
.metric-value {
  font-size: 1.1em;
  font-weight: 600;
  color: #333;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s;
}
.action-btn.view {
  background: #e3f2fd;
  color: #1565c0;
}
.action-btn.view:hover {
  background: #1565c0;
  color: white;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}
.summary-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}
.summary-value {
  font-size: 1.8em;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}
.summary-label {
  color: #666;
  font-size: 0.9em;
}
</style>
