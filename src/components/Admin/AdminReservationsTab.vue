<script lang="ts">
import { useAdminStore } from '@/stores/adminStore'

export default {
  computed: {
    store() { return useAdminStore() },
  },
  async created() {
    await this.store.fetchAllBookings()
  },
  methods: {
    async cancel(id: string) {
      if (!window.confirm('Annuler cette réservation ?')) return
      await this.store.cancelBooking(id)
    },
    formatDate(d: string) {
      return new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
    },
  },
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-base font-semibold text-slate-900">Réservations ({{ store.bookings.length }})</h2>

    <p v-if="store.error" class="text-sm text-red-600">{{ store.error }}</p>
    <div v-if="store.loading" class="text-sm text-slate-400">Chargement...</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
            <th class="pb-2 font-medium">Utilisateur</th>
            <th class="pb-2 font-medium">Film</th>
            <th class="pb-2 font-medium">Séance</th>
            <th class="pb-2 font-medium">Places</th>
            <th class="pb-2 font-medium">Date résa</th>
            <th class="pb-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in store.bookings" :key="booking.id" class="border-b border-slate-100 hover:bg-slate-50">
            <td class="py-2 pr-4 text-slate-600 text-xs">{{ booking.user_email }}</td>
            <td class="py-2 pr-4 text-slate-800">{{ booking.session?.movie?.title ?? '—' }}</td>
            <td class="py-2 pr-4 text-slate-500">{{ booking.session ? formatDate(booking.session.date_time) : '—' }}</td>
            <td class="py-2 pr-4 text-slate-600">{{ booking.seats }}</td>
            <td class="py-2 pr-4 text-slate-400 text-xs">{{ booking.created_at ? formatDate(booking.created_at) : '—' }}</td>
            <td class="py-2">
              <button @click="cancel(booking.id)" class="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded">
                Annuler
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
