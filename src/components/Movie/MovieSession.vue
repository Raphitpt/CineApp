<script lang="ts">
import { useMoviesStore } from "@/stores/movieStore";
import { mapState } from "pinia";

export default {
  computed: {
    ...mapState(useMoviesStore, ["currentMovie", "loading", "error"]),
  },
  mounted() {
    const store = useMoviesStore();
    store.fetchMovieDetails(this.$route.params.movieId as string);
  },
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-5 py-8">
    <div v-if="loading" class="text-center text-slate-400 mt-20">Chargement...</div>
    <p v-else-if="error" class="text-center text-red-500 mt-20">Erreur : {{ error }}</p>
    <template v-if="currentMovie">
      <div class="flex gap-6 items-start flex-wrap mb-8">
        <div
          class="w-36 h-52 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0"
        >
          <img
            v-if="currentMovie.poster_url"
            :src="currentMovie.poster_url"
            :alt="currentMovie.title"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-sm text-slate-400">Pas d'affiche</span>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-2">
            <span class="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">{{
              currentMovie.category
            }}</span>
            <span v-if="currentMovie.year" class="text-xs text-slate-500">{{
              currentMovie.year
            }}</span>
            <span class="text-xs text-slate-400">·</span>
            <span class="text-xs text-slate-500">{{ currentMovie.duration }} min</span>
          </div>

          <h1 class="text-2xl font-medium text-slate-900 mb-2">{{ currentMovie.title }}</h1>

          <div v-if="currentMovie.rating" class="flex items-center gap-1.5 mb-3">
            <span>⭐</span>
            <span class="text-sm font-medium text-slate-800">{{ currentMovie.rating }}</span>
            <span class="text-sm text-slate-400">/ 10</span>
          </div>

          <p v-if="currentMovie.description" class="text-sm text-slate-500 leading-relaxed">
            <span v-dompurify-html="currentMovie.description"></span>
          </p>
        </div>
      </div>

      <div class="border-t border-slate-200 pt-6">
        <h2 class="text-base font-medium text-slate-800 mb-4">Séances disponibles</h2>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          <div
            v-for="session in currentMovie.sessions"
            :key="session.id"
            class="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-slate-400 transition-colors"
          >
            <p class="text-xl font-medium text-slate-900 mb-2">{{ session.time }}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs px-2 py-0.5 rounded-lg bg-green-50 text-green-700"
                >Disponible</span
              >
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
