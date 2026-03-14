<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useMoviesStore } from "./stores/movieStore";
import MovieFilter from "./MovieFilter.vue";
import Movie from "./components/Movie.vue";

const store = useMoviesStore();
onMounted(() => store.fetchMovies());

const renderedMovies = ref(store.movies);

watch(
  () => store.movies,
  (movies) => {
    renderedMovies.value = [...movies];
  },
);

const moviesLength = computed(() => renderedMovies.value.length);
</script>

<template>
  <section class="max-w-7xl mx-auto px-5 py-10">
    <header class="text-center mb-10">
      <h1 class="text-4xl font-bold text-slate-900">Nos films</h1>
      <p class="text-slate-500 mt-2">{{ moviesLength }} films disponibles</p>
    </header>

    <MovieFilter :movies="store.movies" @update-movies="renderedMovies = $event" />

    <div v-if="store.loading" class="text-center text-slate-400 mt-20">Chargement...</div>

    <p v-else-if="store.error" class="text-center text-red-500 mt-20">Erreur : {{ store.error }}</p>

    <div
      v-else-if="renderedMovies.length > 0"
      class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 mt-6"
    >
      <Movie
        v-for="movie in renderedMovies"
        :key="movie.id"
        :movie="movie"
        class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
      />
    </div>

    <div v-else class="text-center mt-20 text-slate-400 text-lg">Aucun film disponible.</div>
  </section>
</template>
