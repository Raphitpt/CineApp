<script lang="ts">
import { useBookingStore } from '@/stores/bookingStore'
import type { Session } from '@/types/movie'

export default {
  props: {
    session: { type: Object as () => Session, required: true },
    movieId: { type: String, required: true },
  },
  emits: ['close', 'booked'],
  data() {
    return { seats: 1 }
  },
  computed: {
    store() { return useBookingStore() },
    remainingSeats() { return this.session.capacity - this.session.booked },
    error() { return this.store.error },
    loading() { return this.store.loading },
  },
  methods: {
    async confirm() {
      const ok = await this.store.book(this.session.id, this.seats, this.movieId)
      if (ok) { this.$emit('booked'); this.$emit('close') }
    },
  },
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
      <h2 class="text-lg font-semibold text-slate-900 mb-1">Réserver</h2>
      <p class="text-sm text-slate-500 mb-5">Séance {{ session.time }} · {{ remainingSeats }} place{{ remainingSeats > 1 ? 's' : '' }} restante{{ remainingSeats > 1 ? 's' : '' }}</p>

      <div class="flex items-center gap-3 mb-5">
        <label class="text-sm text-slate-700">Nombre de places</label>
        <input
          v-model.number="seats"
          type="number"
          :min="1"
          :max="remainingSeats"
          class="w-16 border border-slate-200 rounded-lg px-2 py-1 text-sm text-center outline-none focus:border-slate-400"
        />
      </div>

      <p v-if="error" class="text-xs text-red-500 mb-3">{{ error }}</p>

      <div class="flex gap-2">
        <button
          @click="$emit('close')"
          class="flex-1 text-sm text-slate-600 border border-slate-200 rounded-lg py-2 hover:bg-slate-50 transition-colors"
        >
          Annuler
        </button>
        <button
          @click="confirm"
          :disabled="loading || seats < 1 || seats > remainingSeats"
          class="flex-1 text-sm font-medium bg-slate-900 text-white rounded-lg py-2 hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {{ loading ? '...' : 'Confirmer' }}
        </button>
      </div>
    </div>
  </div>
</template>
