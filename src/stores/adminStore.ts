import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Movie, MovieInsert, Session, SessionInsert } from '@/types/movie'
import type { ReviewWithMovie } from '@/types/review'
import type { AdminUser, BookingWithDetails } from '@/types/admin'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

async function edgeFetch(path: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession()
  return fetch(`${SUPABASE_URL}/functions/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
      'x-user-token': session?.access_token ?? '',
      ...options?.headers,
    },
  })
}

export const useAdminStore = defineStore('admin', () => {
  const movies = ref<Movie[]>([])
  const sessions = ref<Session[]>([])
  const reviews = ref<ReviewWithMovie[]>([])
  const bookings = ref<BookingWithDetails[]>([])
  const users = ref<AdminUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ── Movies ──────────────────────────────────────────────────────────────
  async function fetchAllMovies(): Promise<void> {
    loading.value = true; error.value = null
    const { data, error: err } = await supabase.from('movies').select('*, sessions(*)').order('title')
    loading.value = false
    if (err) { error.value = err.message; return }
    movies.value = data as Movie[]
  }

  async function createMovie(movie: MovieInsert): Promise<boolean> {
    loading.value = true; error.value = null
    const { error: err } = await supabase.from('movies').insert(movie)
    loading.value = false
    if (err) { error.value = err.message; return false }
    await fetchAllMovies()
    return true
  }

  async function updateMovie(id: string, movie: Partial<MovieInsert>): Promise<boolean> {
    loading.value = true; error.value = null
    const { error: err } = await supabase.from('movies').update(movie).eq('id', id)
    loading.value = false
    if (err) { error.value = err.message; return false }
    await fetchAllMovies()
    return true
  }

  async function deleteMovie(id: string): Promise<boolean> {
    loading.value = true; error.value = null
    const { error: err } = await supabase.from('movies').delete().eq('id', id)
    loading.value = false
    if (err) { error.value = err.message; return false }
    movies.value = movies.value.filter(m => m.id !== id)
    return true
  }

  // ── Sessions ─────────────────────────────────────────────────────────────
  async function fetchSessionsByMovie(movieId: string): Promise<void> {
    loading.value = true; error.value = null
    const { data, error: err } = await supabase
      .from('sessions').select('*').eq('movie_id', movieId).order('date_time')
    loading.value = false
    if (err) { error.value = err.message; return }
    sessions.value = (data ?? []) as Session[]
  }

  async function createSession(session: SessionInsert): Promise<boolean> {
    loading.value = true; error.value = null
    const { error: err } = await supabase.from('sessions').insert(session)
    loading.value = false
    if (err) { error.value = err.message; return false }
    await fetchSessionsByMovie(session.movie_id)
    return true
  }

  async function updateSession(id: string, session: Partial<SessionInsert>): Promise<boolean> {
    loading.value = true; error.value = null
    const { error: err } = await supabase.from('sessions').update(session).eq('id', id)
    loading.value = false
    if (err) { error.value = err.message; return false }
    const movieId = sessions.value.find(s => s.id === id)?.movie_id
    if (movieId) await fetchSessionsByMovie(movieId)
    return true
  }

  async function deleteSession(id: string): Promise<boolean> {
    loading.value = true; error.value = null
    const movieId = sessions.value.find(s => s.id === id)?.movie_id
    const { error: err } = await supabase.from('sessions').delete().eq('id', id)
    loading.value = false
    if (err) { error.value = err.message; return false }
    if (movieId) await fetchSessionsByMovie(movieId)
    return true
  }

  // ── Reviews ──────────────────────────────────────────────────────────────
  async function fetchAllReviews(): Promise<void> {
    loading.value = true; error.value = null
    const { data, error: err } = await supabase
      .from('reviews').select('*, movie:movies(title)').order('created_at', { ascending: false })
    loading.value = false
    if (err) { error.value = err.message; return }
    reviews.value = (data ?? []) as ReviewWithMovie[]
  }

  async function deleteReview(id: string): Promise<boolean> {
    loading.value = true; error.value = null
    const { error: err } = await supabase.from('reviews').delete().eq('id', id)
    loading.value = false
    if (err) { error.value = err.message; return false }
    reviews.value = reviews.value.filter(r => r.id !== id)
    return true
  }

  // ── Bookings ─────────────────────────────────────────────────────────────
  async function fetchAllBookings(): Promise<void> {
    loading.value = true; error.value = null
    const [{ data: bookingsData, error: bookingsErr }, usersRes] = await Promise.all([
      supabase.from('bookings').select('*, session:sessions(*, movie:movies(*))').order('created_at', { ascending: false }),
      edgeFetch('/admin-users'),
    ])
    loading.value = false
    if (bookingsErr) { error.value = bookingsErr.message; return }
    const userList: AdminUser[] = usersRes.ok ? await usersRes.json() : []
    const emailMap = Object.fromEntries(userList.map(u => [u.id, u.email]))
    bookings.value = (bookingsData ?? []).map(b => ({
      ...b,
      user_email: emailMap[b.user_id] ?? b.user_id,
    })) as BookingWithDetails[]
  }

  async function cancelBooking(id: string): Promise<boolean> {
    loading.value = true; error.value = null
    const { error: err } = await supabase.from('bookings').delete().eq('id', id)
    loading.value = false
    if (err) { error.value = err.message; return false }
    bookings.value = bookings.value.filter(b => b.id !== id)
    return true
  }

  // ── Users (Edge Function) ─────────────────────────────────────────────────
  async function fetchAllUsers(): Promise<void> {
    loading.value = true; error.value = null
    const res = await edgeFetch('/admin-users')
    loading.value = false
    if (!res.ok) { error.value = `Error ${res.status}`; return }
    users.value = await res.json()
  }

  async function setUserRole(userId: string, role: 'admin' | 'member'): Promise<boolean> {
    loading.value = true; error.value = null
    const res = await edgeFetch('/admin-users/set-role', {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    })
    loading.value = false
    if (!res.ok) { error.value = `Error ${res.status}`; return false }
    // Refresh session if promoting/demoting self
    const authStore = useAuthStore()
    if (authStore.user?.id === userId) {
      await supabase.auth.refreshSession()
    }
    await fetchAllUsers()
    return true
  }

  return {
    movies, sessions, reviews, bookings, users, loading, error,
    fetchAllMovies, createMovie, updateMovie, deleteMovie,
    fetchSessionsByMovie, createSession, updateSession, deleteSession,
    fetchAllReviews, deleteReview,
    fetchAllBookings, cancelBooking,
    fetchAllUsers, setUserRole,
  }
})
