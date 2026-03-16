<script lang="ts">
import { defineComponent } from "vue";
import { useMoviesStore } from "@/stores/movieStore";
import { mapState } from "pinia";
import MovieFilter from "./MovieFilter.vue";
import Movie from "./Movie.vue";

export default defineComponent({
  components: { MovieFilter, Movie },
  data() {
    return {
      renderedMovies: [] as ReturnType<typeof useMoviesStore>["movies"],
    };
  },
  computed: {
    ...mapState(useMoviesStore, ["movies", "loading", "error"]),
    moviesLength() {
      return this.renderedMovies.length;
    },
  },
  watch: {
    movies(newMovies) {
      this.renderedMovies = [...newMovies];
    },
  },
  mounted() {
    const store = useMoviesStore();
    store.fetchMovies();
    this.renderedMovies = [...store.movies];
  },
});
</script>

<template>
  <section class="max-w-7xl mx-auto px-5 py-10">
    <header class="text-center mb-10">
      <h1 class="text-4xl font-bold text-slate-900">Nos films</h1>
      <p class="text-slate-500 mt-2">{{ moviesLength }} films disponibles</p>
    </header>

    <MovieFilter :movies="movies" @update-movies="renderedMovies = $event" />

    <div v-if="loading" class="text-center text-slate-400 mt-20">Chargement...</div>

    <p v-else-if="error" class="text-center text-red-500 mt-20">Erreur : {{ error }}</p>

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
