<script lang="ts">
import { type PropType } from "vue";
import { RouterLink } from "vue-router";
import type { Movie } from "@/types/movie";

export default {
  components: { RouterLink },

  props: {
    movie: {
      type: Object as PropType<Movie>,
      required: true,
    },
  },
};
</script>

<template>
  <div>
    <img
      v-if="movie.poster_url"
      :src="movie.poster_url"
      :alt="movie.title"
      class="w-full h-100 object-cover fit"
    />
    <div
      v-else
      class="w-full h-56 bg-slate-100 flex items-center justify-center text-slate-400 text-sm"
    >
      Pas d'affiche
    </div>

    <div class="p-4">
      <h2 class="text-lg font-semibold text-slate-800 truncate">{{ movie.title }}</h2>

      <div class="flex items-center gap-2 mt-1 text-sm text-slate-500">
        <span v-if="movie.year">{{ movie.year }}</span>
        <span v-if="movie.year">·</span>
        <span>{{ movie.duration }} min</span>
        <span v-if="movie.rating">·</span>
        <span v-if="movie.rating" class="text-yellow-500 font-medium">⭐ {{ movie.rating }}</span>
      </div>

      <span class="inline-block mt-3 text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
        {{ movie.category }}
      </span>

      <p
        v-if="movie.description"
        v-dompurify-html="movie.description"
        class="text-sm text-slate-500 mt-3 line-clamp-2"
      ></p>
      <RouterLink :to="`/seances/${movie.id}`">
        <button
          class="mt-2 bg-slate-900 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Voir les séances
        </button>
      </RouterLink>
    </div>
  </div>
</template>
