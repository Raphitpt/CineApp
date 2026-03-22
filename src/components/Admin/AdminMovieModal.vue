<script lang="ts">
import { useAdminStore } from '@/stores/adminStore'
import type { Movie, MovieInsert } from '@/types/movie'

export default {
  props: {
    movie: { type: Object as () => Movie | null, default: null },
  },
  emits: ['close'],
  data() {
    return {
      form: {
        title: this.movie?.title ?? '',
        description: this.movie?.description ?? '',
        duration: this.movie?.duration ?? 90,
        category: this.movie?.category ?? '',
        poster_url: this.movie?.poster_url ?? '',
        year: this.movie?.year ?? new Date().getFullYear(),
        rating: this.movie?.rating ?? 5,
      } as MovieInsert,
    }
  },
  computed: {
    store() { return useAdminStore() },
    isEdit() { return !!this.movie },
  },
  methods: {
    async submit() {
      const ok = this.isEdit
        ? await this.store.updateMovie(this.movie!.id, this.form)
        : await this.store.createMovie(this.form)
      if (ok) this.$emit('close')
    },
  },
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
      <h2 class="text-lg font-semibold text-slate-900">{{ isEdit ? 'Modifier le film' : 'Ajouter un film' }}</h2>

      <p v-if="store.error" class="text-sm text-red-600">{{ store.error }}</p>

      <form @submit.prevent="submit" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
          <input v-model="form.title" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Durée (min) *</label>
            <input v-model.number="form.duration" type="number" min="1" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Année</label>
            <input v-model.number="form.year" type="number" min="1900" :max="new Date().getFullYear() + 2" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
            <input v-model="form.category" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Note (0–10)</label>
            <input v-model.number="form.rating" type="number" min="0" max="10" step="0.1" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">URL Poster</label>
          <input v-model="form.poster_url" type="url" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50">
            Annuler
          </button>
          <button type="submit" :disabled="store.loading" class="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50">
            {{ store.loading ? '...' : (isEdit ? 'Enregistrer' : 'Ajouter') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
