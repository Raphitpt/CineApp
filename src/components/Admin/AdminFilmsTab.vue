<script lang="ts">
import { useAdminStore } from '@/stores/adminStore'
import AdminMovieModal from './AdminMovieModal.vue'
import AdminSessionModal from './AdminSessionModal.vue'
import type { Movie } from '@/types/movie'

export default {
  components: { AdminMovieModal, AdminSessionModal },
  data() {
    return {
      showMovieModal: false,
      editingMovie: null as Movie | null,
      sessionMovie: null as Movie | null,
    }
  },
  computed: {
    store() { return useAdminStore() },
  },
  async created() {
    await this.store.fetchAllMovies()
  },
  methods: {
    openAdd() { this.editingMovie = null; this.showMovieModal = true },
    openEdit(movie: Movie) { this.editingMovie = movie; this.showMovieModal = true },
    async remove(movie: Movie) {
      if (!window.confirm(`Supprimer "${movie.title}" ? Cette action est irréversible.`)) return
      await this.store.deleteMovie(movie.id)
    },
  },
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-base font-semibold text-slate-900">Films ({{ store.movies.length }})</h2>
      <button @click="openAdd" class="text-sm font-medium bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700">
        + Ajouter un film
      </button>
    </div>

    <p v-if="store.error" class="text-sm text-red-600">{{ store.error }}</p>

    <div v-if="store.loading" class="text-sm text-slate-400">Chargement...</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
            <th class="pb-2 font-medium">Titre</th>
            <th class="pb-2 font-medium">Catégorie</th>
            <th class="pb-2 font-medium">Année</th>
            <th class="pb-2 font-medium">Séances</th>
            <th class="pb-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movie in store.movies" :key="movie.id" class="border-b border-slate-100 hover:bg-slate-50">
            <td class="py-2 pr-4 font-medium text-slate-800">{{ movie.title }}</td>
            <td class="py-2 pr-4 text-slate-500">{{ movie.category }}</td>
            <td class="py-2 pr-4 text-slate-500">{{ movie.year }}</td>
            <td class="py-2 pr-4">
              <button @click="sessionMovie = movie" class="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-2 py-1 rounded flex items-center gap-1">
                <span>{{ movie.sessions?.length ?? 0 }} séance(s)</span>
                <span class="text-slate-400">· Éditer</span>
              </button>
            </td>
            <td class="py-2">
              <div class="flex gap-2 justify-end">
                <button @click="openEdit(movie)" class="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-2 py-1 rounded">
                  Modifier
                </button>
                <button @click="remove(movie)" class="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded">
                  Supprimer
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminMovieModal v-if="showMovieModal" :movie="editingMovie" @close="showMovieModal = false" />
    <AdminSessionModal v-if="sessionMovie" :movie="sessionMovie" @close="sessionMovie = null" />
  </div>
</template>
