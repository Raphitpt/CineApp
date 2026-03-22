import MovieList from '@/components/Movie/MovieList.vue'
import MovieSession from '@/components/Movie/MovieSession.vue'
import MyBookings from '@/components/Booking/MyBookings.vue'
import AdminPanel from '@/components/Admin/AdminPanel.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  { path: '/', component: MovieList },
  { path: '/seances/:movieId', component: MovieSession },
  { path: '/mes-reservations', component: MyBookings, meta: { requiresAuth: true } },
  { path: '/admin', component: AdminPanel, meta: { requiresAuth: true, requiresAdmin: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const authStore = useAuthStore()
  if (!authStore.authReady) {
    await new Promise<void>((resolve) => {
      if (authStore.authReady) { resolve(); return }
      const stop = authStore.$subscribe(() => {
        if (authStore.authReady) { stop(); resolve() }
      })
    })
  }
  if (!authStore.user) return '/'
  if (to.meta.requiresAdmin && !authStore.isAdmin) return '/'
  return true
})

export default router
