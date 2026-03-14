<script>
export default {
  props: {
    movie: {
      type: Object,
      required: true,
    },
  },
};
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
  >
    <img
      v-if="movie.poster_url"
      :src="movie.poster_url"
      :alt="movie.title"
      class="w-full h-56 object-cover"
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

      <p v-if="movie.description" class="text-sm text-slate-500 mt-3 line-clamp-2">
        {{ movie.description }}
      </p>

      <RouterLink :to="`/seances/${movie.id}`">
        <button
          class="mt-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Voir les séances
        </button>
      </RouterLink>
    </div>
  </div>
</template>
