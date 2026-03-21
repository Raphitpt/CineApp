<script lang="ts">
import { useAdminStore } from '@/stores/adminStore'
import type { Movie, Session, SessionInsert } from '@/types/movie'

export default {
  props: {
    movie: { type: Object as () => Movie, required: true },
  },
  emits: ['close'],
  data() {
    return {
      editingSession: null as Session | null,
      showForm: false,
      form: { date_time: '', capacity: 100 } as { date_time: string; capacity: number },
    }
  },
  computed: {
    store() { return useAdminStore() },
  },
  async created() {
    await this.store.fetchSessionsByMovie(this.movie.id)
  },
  methods: {
    openAdd() {
      this.editingSession = null
      this.form = { date_time: '', capacity: 100 }
      this.showForm = true
    },
    openEdit(session: Session) {
      this.editingSession = session
      this.form = { date_time: session.date_time?.slice(0, 16) ?? '', capacity: session.capacity }
      this.showForm = true
    },
    async submit() {
      const payload: SessionInsert = { movie_id: this.movie.id, date_time: this.form.date_time, capacity: this.form.capacity, booked: this.editingSession?.booked ?? 0 }
      const ok = this.editingSession
        ? await this.store.updateSession(this.editingSession.id, { date_time: this.form.date_time, capacity: this.form.capacity })
        : await this.store.createSession(payload)
      if (ok) this.showForm = false
    },
    async remove(session: Session) {
      if (!window.confirm(`Supprimer la séance du ${new Date(session.date_time).toLocaleString('fr-FR')} ?`)) return
      await this.store.deleteSession(session.id)
    },
    formatDate(t: string) {
      return new Date(t).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
    },
  },
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900">Séances — {{ movie.title }}</h2>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-700">✕</button>
      </div>

      <p v-if="store.error" class="text-sm text-red-600">{{ store.error }}</p>

      <div v-if="!store.loading" class="space-y-2 max-h-64 overflow-y-auto">
        <div v-if="store.sessions.length === 0" class="text-sm text-slate-400">Aucune séance</div>
        <div v-for="s in store.sessions" :key="s.id"
          class="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2">
          <div>
            <span class="text-sm text-slate-800">{{ formatDate(s.date_time) }}</span>
            <span class="ml-2 text-xs text-slate-500">{{ s.booked }}/{{ s.capacity }} places</span>
          </div>
          <div class="flex gap-2">
            <button @click="openEdit(s)" class="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 border border-slate-200 rounded">
              Modifier
            </button>
            <button @click="remove(s)" class="text-xs text-red-500 hover:text-red-700 px-2 py-1 border border-red-200 rounded">
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div v-if="showForm" class="border-t pt-4 space-y-3">
        <h3 class="text-sm font-medium text-slate-800">{{ editingSession ? 'Modifier la séance' : 'Nouvelle séance' }}</h3>
        <form @submit.prevent="submit" class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Date & heure *</label>
            <input v-model="form.date_time" type="datetime-local" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Capacité *</label>
            <input v-model.number="form.capacity" type="number" min="1" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showForm = false" class="px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              Annuler
            </button>
            <button type="submit" :disabled="store.loading" class="px-3 py-1.5 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50">
              {{ store.loading ? '...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>

      <button v-if="!showForm" @click="openAdd" class="w-full text-sm text-slate-600 border border-dashed border-slate-300 rounded-lg py-2 hover:bg-slate-50">
        + Ajouter une séance
      </button>
    </div>
  </div>
</template>
