import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useMoviesStore } from '@/stores/movieStore'
import type { Booking } from '@/types/movie'

export const useBookingStore = defineStore('bookings', () => {
  const bookings = ref<Booking[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUserBookings(): Promise<void> {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('bookings')
      .select('*, session:sessions(*, movie:movies(*))')
      .order('created_at', { ascending: false })
    loading.value = false
    if (err) { error.value = err.message; return }
    bookings.value = data as Booking[]
  }

  async function book(sessionId: string, seats: number, movieId: string): Promise<boolean> {
    loading.value = true
    error.value = null
    const { error: err } = await supabase
      .from('bookings')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({ session_id: sessionId, seats } as any)
    loading.value = false
    if (err) { error.value = err.message; return false }
    // Refresh session counters in movie store
    const movieStore = useMoviesStore()
    await movieStore.fetchMovieDetails(movieId)
    return true
  }

  async function cancelBooking(bookingId: string): Promise<boolean> {
    loading.value = true
    error.value = null
    const { error: err } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)
    loading.value = false
    if (err) { error.value = err.message; return false }
    bookings.value = bookings.value.filter((b) => b.id !== bookingId)
    return true
  }

  return { bookings, loading, error, fetchUserBookings, book, cancelBooking }
})
