import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { subsonicClient } from '@/services/subsonic'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 路由守卫
router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    if (!subsonicClient.isAuthenticated() && !subsonicClient.restoreAuth()) {
      return '/login'
    }
  }
  return true
})

export default router
