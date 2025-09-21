import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

// Lazy routes
const Home = () => import('@/pages/Dashboard.vue')
const Documents = () => import('@/pages/Documents.vue')
const Upload = () => import('@/pages/Upload.vue')
const Reports = () => import('@/pages/Reports.vue')

// Public
const Login = () => import('@/pages/public/Login.vue')
const Status = () => import('@/pages/public/Status.vue')
const Help = () => import('@/pages/public/Help.vue')

// Shared
const Search = () => import('@/pages/shared/Search.vue')
const DocumentView = () => import('@/pages/shared/DocumentView.vue')
const Profile = () => import('@/pages/shared/Profile.vue')
const Notifications = () => import('@/pages/shared/Notifications.vue')

// Role dashboards (redirect targets)
const Dashboard = () => import('@/pages/Dashboard.vue')

// Owner
const OwnerSubmissions = () => import('@/pages/owner/Submissions.vue')
const OwnerReviews = () => import('@/pages/owner/Reviews.vue')

// Controller
const ControllerUpload = () => import('@/pages/controller/Upload.vue')
const ControllerPublish = () => import('@/pages/controller/Publish.vue')
const ControllerArchive = () => import('@/pages/controller/Archive.vue')
const ControllerCodes = () => import('@/pages/controller/Codes.vue')

// QMS
const QMSReports = () => import('@/pages/qms/Reports.vue')
const QMSKpis = () => import('@/pages/qms/Kpis.vue')

// Admin
const AdminUsers = () => import('@/pages/admin/Users.vue')
const AdminRoles = () => import('@/pages/admin/Roles.vue')
const AdminSettings = () => import('@/pages/admin/Settings.vue')
const AdminAudit = () => import('@/pages/admin/Audit.vue')
const AdminBackups = () => import('@/pages/admin/Backups.vue')

export const routes: RouteRecordRaw[] = [
  // Public
  { path: '/login', name: 'login', component: Login, meta: { public: true } },
  { path: '/status', name: 'status', component: Status, meta: { public: true } },
  { path: '/help', name: 'help', component: Help, meta: { public: true } },

  // Auth base -> role-aware dashboard page
  { path: '/', name: 'home', component: Home },

  // Shared
  { path: '/search', name: 'search', component: Search },
  { path: '/documents', name: 'documents', component: Documents },
  { path: '/documents/:id', name: 'document.view', component: DocumentView, props: true },
  { path: '/profile', name: 'profile', component: Profile },
  { path: '/notifications', name: 'notifications', component: Notifications },

  // Owner
  { path: '/owner/submissions', name: 'owner.submissions', component: OwnerSubmissions, meta: { requiredRoles: ['DocumentOwner','Admin'] } },
  { path: '/owner/reviews', name: 'owner.reviews', component: OwnerReviews, meta: { requiredRoles: ['DocumentOwner','Admin'] } },

  // Controller
  { path: '/controller/upload', name: 'controller.upload', component: ControllerUpload, meta: { requiredRoles: ['DocumentController','Admin'] } },
  { path: '/controller/publish', name: 'controller.publish', component: ControllerPublish, meta: { requiredRoles: ['DocumentController','Admin'] } },
  { path: '/controller/archive', name: 'controller.archive', component: ControllerArchive, meta: { requiredRoles: ['DocumentController','Admin'] } },
  { path: '/controller/codes', name: 'controller.codes', component: ControllerCodes, meta: { requiredRoles: ['DocumentController','Admin'] } },

  // QMS
  { path: '/qms/reports', name: 'qms.reports', component: QMSReports, meta: { requiredRoles: ['QMS','Admin'] } },
  { path: '/qms/kpis', name: 'qms.kpis', component: QMSKpis, meta: { requiredRoles: ['QMS','Admin'] } },

  // Admin
  { path: '/admin/users', name: 'admin.users', component: AdminUsers, meta: { requiredRoles: ['Admin'] } },
  { path: '/admin/roles', name: 'admin.roles', component: AdminRoles, meta: { requiredRoles: ['Admin'] } },
  { path: '/admin/settings', name: 'admin.settings', component: AdminSettings, meta: { requiredRoles: ['Admin'] } },
  { path: '/admin/audit', name: 'admin.audit', component: AdminAudit, meta: { requiredRoles: ['Admin'] } },
  { path: '/admin/backups', name: 'admin.backups', component: AdminBackups, meta: { requiredRoles: ['Admin'] } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Guard helpers
function dashboardFor(role: string) {
  switch (role) {
    case 'DocumentOwner': return '/owner/submissions'
    case 'DocumentController': return '/controller/upload'
    case 'QMS': return '/qms/reports'
    case 'Admin': return '/admin/users'
    case 'ExternalAuditor': return '/search'
    default: return '/search'
  }
}

router.beforeEach((to) => {
  const auth = useAuthStore()
  const toPublic = to.meta && (to.meta as any).public
  const needsAuth = !toPublic

  // Require auth for non-public routes; preserve deep-link target
  if (needsAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // No redirect for '/'; Dashboard is role-aware component

  // RBAC per-route via meta.requiredRoles
  const requiredRoles = (to.meta as any)?.requiredRoles as string[] | undefined
  if (requiredRoles && auth.isAuthenticated) {
    if (!requiredRoles.includes(auth.role)) {
      useNotificationsStore().push('You do not have permission to access this page', 'warn')
      return '/'
    }
  }

  return true
})

export default router
