import MovieList from '@/components/Movie/MovieList.vue'
import { createRouter, createWebHistory } from 'vue-router'
import MovieSession from '@/components/Movie/MovieSession.vue'

const routes = [
  { path: '/', component: MovieList },
  { path: '/seances/:movieId', component: MovieSession },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
