<script lang="ts">
import { useMoviesStore } from '@/stores/movieStore'
import { useAuthStore } from '@/stores/authStore'
import { useBookingStore } from '@/stores/bookingStore'
import { mapState } from 'pinia'
import BookingModal from '@/components/Booking/BookingModal.vue'
import AuthModal from '@/components/Auth/AuthModal.vue'

export default {
  components: { BookingModal, AuthModal },
  data() {
    return {
      selectedSession: null as import('@/types/movie').Session | null,
      showBookingModal: false,
      showAuthModal: false,
    }
  },
  computed: {
    ...mapState(useMoviesStore, ['currentMovie', 'loading', 'error']),
    user() { return useAuthStore().user },
    userBookings() { return useBookingStore().bookings },
    bookedSessionIds() {
      return new Set(this.userBookings.map((b) => b.session_id))
    },
  },
  mounted() {
    const movieStore = useMoviesStore()
    movieStore.fetchMovieDetails(this.$route.params.movieId as string)
    const authStore = useAuthStore()
    if (authStore.user) useBookingStore().fetchUserBookings()
  },
  methods: {
    sessionState(session: import('@/types/movie').Session): 'available' | 'booked' | 'full' {
      if (this.bookedSessionIds.has(session.id)) return 'booked'
      if (session.booked >= session.capacity) return 'full'
      return 'available'
    },
    onReserveClick(session: import('@/types/movie').Session) {
      if (!this.user) { this.showAuthModal = true; return }
      this.selectedSession = session
      this.showBookingModal = true
    },
    async onCancelFromSession(session: import('@/types/movie').Session) {
      const booking = this.userBookings.find((b) => b.session_id === session.id)
      if (!booking) return
      await useBookingStore().cancelBooking(booking.id)
      await useMoviesStore().fetchMovieDetails(this.$route.params.movieId as string)
    },
  },
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-5 py-8">
    <div v-if="loading" class="text-center text-slate-400 mt-20">Chargement...</div>
    <p v-else-if="error" class="text-center text-red-500 mt-20">Erreur : {{ error }}</p>
    <template v-if="currentMovie">
      <div class="flex gap-6 items-start flex-wrap mb-8">
        <div class="w-36 h-52 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
          <img v-if="currentMovie.poster_url" :src="currentMovie.poster_url" :alt="currentMovie.title" class="w-full h-full object-cover" />
          <span v-else class="text-sm text-slate-400">Pas d'affiche</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-2">
            <span class="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">{{ currentMovie.category }}</span>
            <span v-if="currentMovie.year" class="text-xs text-slate-500">{{ currentMovie.year }}</span>
            <span class="text-xs text-slate-400">·</span>
            <span class="text-xs text-slate-500">{{ currentMovie.duration }} min</span>
          </div>
          <h1 class="text-2xl font-medium text-slate-900 mb-2">{{ currentMovie.title }}</h1>
          <div v-if="currentMovie.rating" class="flex items-center gap-1.5 mb-3">
            <span>⭐</span>
            <span class="text-sm font-medium text-slate-800">{{ currentMovie.rating }}</span>
            <span class="text-sm text-slate-400">/ 10</span>
          </div>
          <p v-if="currentMovie.description" class="text-sm text-slate-500 leading-relaxed">
            <span v-dompurify-html="currentMovie.description"></span>
          </p>
        </div>
      </div>

      <div class="border-t border-slate-200 pt-6">
        <h2 class="text-base font-medium text-slate-800 mb-4">Séances disponibles</h2>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          <div
            v-for="session in currentMovie.sessions"
            :key="session.id"
            class="bg-white border rounded-2xl p-4 transition-colors"
            :class="{
              'border-slate-200 hover:border-slate-400 cursor-pointer': sessionState(session) === 'available',
              'border-blue-200 bg-blue-50': sessionState(session) === 'booked',
              'border-slate-100 opacity-60': sessionState(session) === 'full',
            }"
          >
            <p class="text-xl font-medium text-slate-900 mb-1">{{ session.time }}</p>
            <p class="text-xs text-slate-400 mb-3">
              {{ session.capacity - session.booked }} / {{ session.capacity }} places
            </p>
            <div class="flex items-center justify-between gap-2">
              <span
                class="text-xs px-2 py-0.5 rounded-lg"
                :class="{
                  'bg-green-50 text-green-700': sessionState(session) === 'available',
                  'bg-blue-100 text-blue-700': sessionState(session) === 'booked',
                  'bg-red-50 text-red-600': sessionState(session) === 'full',
                }"
              >
                {{ sessionState(session) === 'available' ? 'Disponible' : sessionState(session) === 'booked' ? 'Réservé' : 'Complet' }}
              </span>

              <button
                v-if="sessionState(session) === 'available'"
                @click="onReserveClick(session)"
                class="text-xs font-medium bg-slate-900 text-white px-2.5 py-1 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Réserver
              </button>
              <button
                v-else-if="sessionState(session) === 'booked'"
                @click="onCancelFromSession(session)"
                class="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <BookingModal
      v-if="showBookingModal && selectedSession"
      :session="selectedSession"
      :movie-id="($route.params.movieId as string)"
      @close="showBookingModal = false"
      @booked="showBookingModal = false"
    />
    <AuthModal v-if="showAuthModal" @close="showAuthModal = false" />
  </div>
</template>
