import MovieList from '@/components/Movie/MovieList.vue'
import MovieSession from '@/components/Movie/MovieSession.vue'
import MyBookings from '@/components/Booking/MyBookings.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  { path: '/', component: MovieList },
  { path: '/seances/:movieId', component: MovieSession },
  { path: '/mes-reservations', component: MyBookings, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true
  const authStore = useAuthStore()
  // Wait for Supabase to resolve the initial session before evaluating auth state
  if (!authStore.authReady) {
    await new Promise<void>((resolve) => {
      const stop = authStore.$subscribe(() => {
        if (authStore.authReady) { stop(); resolve() }
      })
    })
  }
  if (!authStore.user) return '/'
  return true
})

export default router
