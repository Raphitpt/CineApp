import MovieList from "@/MovieList.vue";
import MovieSession from "@/MovieSession.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: MovieList },
  { path: "/seances/:movieId", component: MovieSession },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
