import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Lazy load components
const LoginView = () => import('../pages/LoginView.vue');
const DashboardView = () => import('../pages/DashboardView.vue');
const UserJourneyView = () => import('../pages/UserJourneyView.vue');
const OrganizationProjectsView = () => import('../pages/OrganizationProjectsView.vue');
const ProjectAnalyticsDashboard = () => import('../pages/ProjectAnalyticsDashboard.vue');
const DasboardT4lView =()=> import('../pages/DashboardT4l.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false, hideNav: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/organizations/:id/projects',
    name: 'OrganizationProjects',
    component: OrganizationProjectsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/DashboardT4l',
    name: 'DashboardT4l',
    component: DasboardT4lView,
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/:id/analytics',
    name: 'ProjectAnalytics',
    component: ProjectAnalyticsDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    name: 'Users',
    component: UserJourneyView,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);

  // If route requires auth and user is not authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    // Try to fetch current user if token exists
    if (authStore.token) {
      const success = await authStore.fetchCurrentUser();
      if (success) {
        next();
      } else {
        next('/login');
      }
    } else {
      next('/login');
    }
  } 
  // If user is authenticated and tries to access login
  else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } 
  // Allow navigation
  else {
    next();
  }
});

export default router;
