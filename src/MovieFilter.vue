<script lang="ts">
import type { Movie } from "./types/movie";

export default {
  emits: ["update-movies"],
  props: {
    movies: {
      type: Array as () => Movie[],
      required: true,
    },
  },
  data() {
    return {
      search: "",
      category: "",
      minRating: 0,
      era: "",
      orderBy: "",
    };
  },
  computed: {
    filteredMovies() {
      let result = [...this.movies];

      if (this.search.trim()) {
        const searchLower = this.search.toLowerCase();
        result = result.filter((movie) => movie.title.toLowerCase().includes(searchLower));
      }

      if (this.category) {
        result = result.filter((movie) => movie.category === this.category);
      }

      // Filtre par note minimale
      if (this.minRating > 0) {
        result = result.filter((movie) => movie.rating >= this.minRating);
      }

      // Filtre par période
      if (this.era === "recent") {
        result = result.filter((movie) => movie.year >= 2015);
      } else if (this.era === "classic") {
        result = result.filter((movie) => movie.year < 2000);
      }

      return result;
    },
    sortedMovies() {
      const result = [...this.filteredMovies];
      switch (this.orderBy) {
        case "titleAsc":
          return result.sort((a, b) => a.title.localeCompare(b.title));
        case "titleDesc":
          return result.sort((a, b) => b.title.localeCompare(a.title));
        case "yearDesc":
          return result.sort((a, b) => b.year - a.year);
        case "yearAsc":
          return result.sort((a, b) => a.year - b.year);
        case "ratingDesc":
          return result.sort((a, b) => b.rating - a.rating);
        case "durationAsc":
          return result.sort((a, b) => a.duration - b.duration);
        default:
          return result;
      }
    },
    availableCategories() {
      return [...new Set(this.movies.map((movie: Movie) => movie.category).filter(Boolean))];
    },
  },
  watch: {
    sortedMovies(newValue) {
      this.$emit("update-movies", newValue);
    },
  },
};
</script>

<template>
  <aside class="mb-10">
    <div class="flex flex-wrap gap-3 items-end">
      <div class="flex flex-col gap-1.5 min-w-[220px] flex-1">
        <label class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Recherche
        </label>
        <div class="relative">
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            v-model="search"
            placeholder="Titre du film…"
            class="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1.5 min-w-[160px]">
        <label class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Catégorie
        </label>
        <select
          v-model="category"
          class="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition appearance-none cursor-pointer"
        >
          <option value="">Toutes</option>
          <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5 min-w-[180px]">
        <label class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Trier par
        </label>
        <select
          v-model="orderBy"
          class="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition appearance-none cursor-pointer"
        >
          <option value="">Par défaut</option>
          <option value="titleAsc">Titre (A → Z)</option>
          <option value="titleDesc">Titre (Z → A)</option>
          <option value="yearDesc">Année (récent)</option>
          <option value="yearAsc">Année (ancien)</option>
          <option value="ratingDesc">Meilleure note</option>
          <option value="durationAsc">Durée croissante</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Période
        </label>
        <div class="flex gap-1.5">
          <button
            v-for="opt in [
              { value: '', label: 'Tous' },
              { value: 'recent', label: '2015+' },
              { value: 'classic', label: 'Classiques' },
            ]"
            :key="opt.value"
            type="button"
            @click="era = opt.value"
            :class="[
              'px-3.5 py-2.5 rounded-xl text-sm font-medium border transition',
              era === opt.value
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700',
            ]"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-1.5 min-w-[160px]">
        <label class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Note min.
          <span class="ml-1 text-slate-600 font-bold normal-case tracking-normal">
            {{ minRating > 0 ? `≥ ${minRating}` : "Toutes" }}
          </span>
        </label>
        <div class="flex items-center gap-2.5 px-1 py-2.5">
          <span class="text-xs text-slate-300">0</span>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            v-model.number="minRating"
            class="flex-1 h-1 accent-slate-900 cursor-pointer"
          />
          <span class="text-xs text-slate-300">10</span>
        </div>
      </div>
    </div>

    <p class="mt-4 text-xs text-slate-400 tracking-wide">
      <span class="font-semibold text-slate-600">{{ sortedMovies.length }}</span>
      film{{ sortedMovies.length > 1 ? "s" : "" }} affiché{{ sortedMovies.length > 1 ? "s" : "" }}
    </p>
  </aside>
</template>
