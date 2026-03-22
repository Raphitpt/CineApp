<script lang="ts">
import { useAdminStore } from '@/stores/adminStore'

export default {
  computed: {
    store() { return useAdminStore() },
  },
  async created() {
    await this.store.fetchAllReviews()
  },
  methods: {
    async remove(id: string, author: string) {
      if (!window.confirm(`Supprimer l'avis de ${author} ?`)) return
      await this.store.deleteReview(id)
    },
    formatDate(d: string) {
      return new Date(d).toLocaleDateString('fr-FR')
    },
  },
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-base font-semibold text-slate-900">Avis ({{ store.reviews.length }})</h2>

    <p v-if="store.error" class="text-sm text-red-600">{{ store.error }}</p>
    <div v-if="store.loading" class="text-sm text-slate-400">Chargement...</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
            <th class="pb-2 font-medium">Film</th>
            <th class="pb-2 font-medium">Auteur</th>
            <th class="pb-2 font-medium">Note</th>
            <th class="pb-2 font-medium">Commentaire</th>
            <th class="pb-2 font-medium">Date</th>
            <th class="pb-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="review in store.reviews" :key="review.id" class="border-b border-slate-100 hover:bg-slate-50">
            <td class="py-2 pr-4 text-slate-800">{{ review.movie?.title ?? '—' }}</td>
            <td class="py-2 pr-4 text-slate-600">{{ review.author }}</td>
            <td class="py-2 pr-4 text-slate-600">{{ review.rating }}/10</td>
            <td class="py-2 pr-4 text-slate-500 max-w-xs truncate">{{ review.comment }}</td>
            <td class="py-2 pr-4 text-slate-400 text-xs">{{ formatDate(review.created_at) }}</td>
            <td class="py-2">
              <button @click="remove(review.id, review.author)" class="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded">
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
