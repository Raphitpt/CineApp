import FilmList from "@/FilmList.vue";
import FilmSession from "@/FilmSession.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: FilmList },
  { path: "/seances/:movieId", component: FilmSession },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export default router;
