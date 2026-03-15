# Auth & Booking Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email/password authentication and session booking (with cancellation) to the GoOut cinema app.

**Architecture:** Pinia Composition API stores (`authStore`, `bookingStore`) backed by Supabase Auth and a new `bookings` table. A global `AppNavbar` replaces the existing header in `App.vue`. `MovieSession` gains booking UI. A new `/mes-reservations` page lists and cancels bookings.

**Tech Stack:** Vue 3 (Options API for components, Composition API for stores), Pinia 3, Supabase JS v2, TypeScript, Tailwind CSS v4, Vue Router 5.

**Spec:** `docs/superpowers/specs/2026-03-15-auth-booking-design.md`

**Verification:** No test framework is installed. Each task uses `npm run type-check` and manual browser verification steps.

---

## Chunk 1: Database & Types

### Task 1: Supabase — create `bookings` table and constraints

**Files:**
- No source files — Supabase dashboard / SQL editor only

- [ ] **Step 1: Run this SQL in the Supabase SQL editor**

```sql
-- 1. Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  seats integer NOT NULL CHECK (seats > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, session_id)
);

-- 2. Add capacity constraint to sessions
ALTER TABLE sessions ADD CONSTRAINT sessions_booked_lte_capacity CHECK (booked <= capacity);

-- 3. Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookings"
  ON bookings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own bookings"
  ON bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookings"
  ON bookings FOR DELETE
  USING (user_id = auth.uid());

-- 4. Trigger to maintain sessions.booked
CREATE OR REPLACE FUNCTION update_session_booked()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE sessions SET booked = booked + NEW.seats WHERE id = NEW.session_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE sessions SET booked = booked - OLD.seats WHERE id = OLD.session_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER bookings_update_booked
  AFTER INSERT OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_session_booked();
```

- [ ] **Step 2: Verify in Supabase Table Editor**
  - Table `bookings` exists with all columns
  - RLS is enabled (lock icon visible)
  - Test: insert a row manually, check `sessions.booked` increments
  - Test: delete that row, check `sessions.booked` decrements

---

### Task 2: Update TypeScript types

**Files:**
- Modify: `src/types/database.types.ts` — add `bookings` table shape
- Modify: `src/types/movie.ts` — add `Booking` interface

- [ ] **Step 1: Add `bookings` table to `database.types.ts`**

In `src/types/database.types.ts`, inside `public.Tables`, add after the `sessions` block:

```ts
bookings: {
  Row: {
    id: string
    user_id: string
    session_id: string
    seats: number
    created_at: string | null
  }
  Insert: {
    id?: string
    user_id: string
    session_id: string
    seats: number
    created_at?: string | null
  }
  Update: {
    id?: string
    user_id?: string
    session_id?: string
    seats?: number
    created_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "bookings_session_id_fkey"
      columns: ["session_id"]
      isOneToOne: false
      referencedRelation: "sessions"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "bookings_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
```

- [ ] **Step 2: Add `Booking` interface to `src/types/movie.ts`**

```ts
export interface Booking {
  id: string
  user_id: string
  session_id: string
  seats: number
  created_at: string
  session?: Session & { movie?: Movie }
}
```

- [ ] **Step 3: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/database.types.ts src/types/movie.ts
git commit -m "feat: add bookings types"
```

---

## Chunk 2: Auth Store & Navbar

### Task 3: `authStore`

**Files:**
- Create: `src/stores/authStore.ts`

- [ ] **Step 1: Create `src/stores/authStore.ts`**

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authReady = ref(false)

  function initAuth() {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
      authReady.value = true
    })
    return subscription
  }

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    loading.value = false
    if (err) { error.value = err.message; return false }
    return true
  }

  async function register(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    const { error: err } = await supabase.auth.signUp({ email, password })
    loading.value = false
    if (err) { error.value = err.message; return false }
    return true
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, loading, error, authReady, initAuth, login, register, logout }
})
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/stores/authStore.ts
git commit -m "feat: add authStore"
```

---

### Task 4: `AuthModal` component

**Files:**
- Create: `src/components/Auth/AuthModal.vue`

- [ ] **Step 1: Create `src/components/Auth/AuthModal.vue`**

```vue
<script lang="ts">
import { useAuthStore } from '@/stores/authStore'

export default {
  emits: ['close'],
  data() {
    return {
      mode: 'login' as 'login' | 'register',
      email: '',
      password: '',
      passwordConfirm: '',
    }
  },
  computed: {
    store() { return useAuthStore() },
    error() { return this.store.error },
    loading() { return this.store.loading },
  },
  methods: {
    async submit() {
      this.store.error = null
      if (this.mode === 'login') {
        const ok = await this.store.login(this.email, this.password)
        if (ok) this.$emit('close')
      } else {
        if (this.password !== this.passwordConfirm) {
          this.store.error = 'Les mots de passe ne correspondent pas'
          return
        }
        const ok = await this.store.register(this.email, this.password)
        if (ok) this.$emit('close')
      }
    },
    toggleMode() {
      this.mode = this.mode === 'login' ? 'register' : 'login'
      this.store.error = null
    },
  },
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
      <h2 class="text-lg font-semibold text-slate-900 mb-5">
        {{ mode === 'login' ? 'Connexion' : 'Créer un compte' }}
      </h2>

      <form @submit.prevent="submit" class="flex flex-col gap-3">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
          class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Mot de passe"
          required
          class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
        <input
          v-if="mode === 'register'"
          v-model="passwordConfirm"
          type="password"
          placeholder="Confirmer le mot de passe"
          required
          class="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400"
        />

        <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="bg-slate-900 text-white text-sm font-medium rounded-lg py-2 hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {{ loading ? '...' : (mode === 'login' ? 'Se connecter' : 'S\'inscrire') }}
        </button>
      </form>

      <button
        class="mt-4 text-xs text-slate-500 hover:text-slate-800 w-full text-center"
        @click="toggleMode"
      >
        {{ mode === 'login' ? 'Pas de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter' }}
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Auth/AuthModal.vue
git commit -m "feat: add AuthModal component"
```

---

### Task 5: `AppNavbar` component

**Files:**
- Create: `src/components/AppNavbar.vue`

- [ ] **Step 1: Create `src/components/AppNavbar.vue`**

```vue
<script lang="ts">
import { useAuthStore } from '@/stores/authStore'
import AuthModal from '@/components/Auth/AuthModal.vue'

export default {
  components: { AuthModal },
  data() {
    return { showAuthModal: false }
  },
  computed: {
    store() { return useAuthStore() },
    user() { return this.store.user },
    isBasePath() { return this.$route.path === '/' },
  },
  methods: {
    async logout() { await this.store.logout() },
  },
}
</script>

<template>
  <header class="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="M8 4v16M16 4v16M2 9h3M19 9h3M2 15h3M19 15h3" />
      </svg>
      <span class="text-sm font-medium text-slate-900">CinéApp</span>
    </div>

    <div class="flex items-center gap-3">
      <RouterLink
        v-if="!isBasePath"
        to="/"
        class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Retour aux films
      </RouterLink>

      <template v-if="user">
        <span class="text-xs text-slate-500 hidden sm:block">{{ user.email }}</span>
        <RouterLink
          to="/mes-reservations"
          class="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Mes réservations
        </RouterLink>
        <button
          @click="logout"
          class="text-sm text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Déconnexion
        </button>
      </template>

      <button
        v-else
        @click="showAuthModal = true"
        class="text-sm font-medium bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
      >
        Connexion
      </button>
    </div>
  </header>

  <AuthModal v-if="showAuthModal" @close="showAuthModal = false" />
</template>
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/AppNavbar.vue
git commit -m "feat: add AppNavbar component"
```

---

### Task 6: Wire `AppNavbar` into `App.vue`

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Replace `App.vue` content**

```vue
<script lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import { useAuthStore } from '@/stores/authStore'

export default {
  components: { AppNavbar },
  data() {
    return { authSubscription: null as { unsubscribe: () => void } | null }
  },
  mounted() {
    const authStore = useAuthStore()
    this.authSubscription = authStore.initAuth()
  },
  beforeUnmount() {
    this.authSubscription?.unsubscribe()
  },
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <main class="flex-1 bg-slate-50 py-8 px-5">
      <div class="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Manual verification**
  - Run `npm run dev`
  - Navbar visible avec logo + bouton "Connexion"
  - Clic "Connexion" → modal login/inscription s'ouvre
  - Inscription avec email/password → modal se ferme, email visible dans navbar
  - Bouton "Déconnexion" → retour à l'état non connecté
  - Rechargement page → utilisateur reste connecté (session persistée par Supabase)

- [ ] **Step 4: Commit**

```bash
git add src/App.vue
git commit -m "feat: wire AppNavbar into App.vue with auth init"
```

---

## Chunk 3: Navigation Guard & Routing

### Task 7: Add `/mes-reservations` route with auth guard

**Files:**
- Modify: `src/router/index.ts`
- Create: placeholder `src/components/Booking/MyBookings.vue` (temporary, completed in Task 10)

- [ ] **Step 1: Create temporary `MyBookings.vue` placeholder**

```vue
<template>
  <div class="text-slate-500 text-sm">Mes réservations (à implémenter)</div>
</template>
```

- [ ] **Step 2: Update `src/router/index.ts`**

```ts
import MovieList from '@/components/Movie/MovieList.vue'
import MovieSession from '@/components/Movie/MovieSession.vue'
import MyBookings from '@/components/Booking/MyBookings.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  { path: '/', component: MovieList },
  { path: '/seances/:movieId', component: MovieSession },
  { path: '/mes-reservations', component: MyBookings, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true
  const authStore = useAuthStore()
  // Wait for Supabase to resolve the initial session before evaluating auth state
  if (!authStore.authReady) {
    await new Promise<void>((resolve) => {
      const stop = authStore.$subscribe(() => {
        if (authStore.authReady) { stop(); resolve() }
      })
    })
  }
  if (!authStore.user) return '/'
  return true
})

export default router
```

- [ ] **Step 3: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 4: Manual verification**
  - Non connecté : naviguer vers `/mes-reservations` → redirige vers `/`
  - Connecté : naviguer vers `/mes-reservations` → page placeholder visible
  - Rechargement sur `/mes-reservations` connecté → reste sur la page (authReady attend)

- [ ] **Step 5: Commit**

```bash
git add src/router/index.ts src/components/Booking/MyBookings.vue
git commit -m "feat: add /mes-reservations route with auth guard"
```

---

## Chunk 4: Booking Store & Modal

### Task 8: `bookingStore`

**Files:**
- Create: `src/stores/bookingStore.ts`

- [ ] **Step 1: Create `src/stores/bookingStore.ts`**

```ts
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
      .insert({ session_id: sessionId, seats })
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
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/stores/bookingStore.ts
git commit -m "feat: add bookingStore"
```

---

### Task 9: `BookingModal` component

**Files:**
- Create: `src/components/Booking/BookingModal.vue`

- [ ] **Step 1: Create `src/components/Booking/BookingModal.vue`**

```vue
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
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Booking/BookingModal.vue
git commit -m "feat: add BookingModal component"
```

---

## Chunk 5: MovieSession & MyBookings

### Task 10: Update `MovieSession.vue` with booking UI

**Files:**
- Modify: `src/components/Movie/MovieSession.vue`

Context on the current file: it displays a movie's sessions in a grid of cards. Each card currently shows the time and a static "Disponible" badge. We need to add 3 states and a booking button.

- [ ] **Step 1: Replace `MovieSession.vue` content**

```vue
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
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Manual verification**
  - Non connecté : clic "Réserver" → AuthModal s'ouvre
  - Connecté : clic "Réserver" → BookingModal s'ouvre avec sélecteur de places
  - Après réservation : badge passe à "Réservé" bleu, compteur mis à jour
  - Clic "Annuler" sur une séance réservée → badge repasse à "Disponible"
  - Séance complète (`booked >= capacity`) → badge rouge "Complet", pas de bouton

- [ ] **Step 4: Commit**

```bash
git add src/components/Movie/MovieSession.vue
git commit -m "feat: add booking UI to MovieSession"
```

---

### Task 11: `MyBookings.vue` page

**Files:**
- Modify: `src/components/Booking/MyBookings.vue` (replace placeholder from Task 7)

- [ ] **Step 1: Replace `MyBookings.vue` with full implementation**

```vue
<script lang="ts">
import { useBookingStore } from '@/stores/bookingStore'
import { mapState } from 'pinia'

export default {
  computed: {
    ...mapState(useBookingStore, ['bookings', 'loading', 'error']),
  },
  mounted() {
    useBookingStore().fetchUserBookings()
  },
  methods: {
    async cancel(bookingId: string) {
      await useBookingStore().cancelBooking(bookingId)
    },
    formatDate(dateStr: string) {
      return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    },
  },
}
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-slate-900 mb-6">Mes réservations</h1>

    <div v-if="loading" class="text-slate-400 text-sm">Chargement...</div>
    <p v-else-if="error" class="text-red-500 text-sm">Erreur : {{ error }}</p>

    <div v-else-if="bookings.length === 0" class="text-slate-400 text-sm">
      Aucune réservation pour l'instant.
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="booking in bookings"
        :key="booking.id"
        class="flex items-center justify-between gap-4 border border-slate-200 rounded-2xl p-4"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-900 truncate">
            {{ booking.session?.movie?.title ?? '—' }}
          </p>
          <p class="text-xs text-slate-500 mt-0.5">
            Séance {{ booking.session?.time ?? '—' }} · {{ booking.seats }} place{{ booking.seats > 1 ? 's' : '' }}
          </p>
          <p class="text-xs text-slate-400 mt-0.5">Réservé le {{ formatDate(booking.created_at) }}</p>
        </div>

        <button
          @click="cancel(booking.id)"
          class="shrink-0 text-xs text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Manual verification**
  - Connecté avec des réservations : liste affichée avec titre film, séance, places, date
  - Clic "Annuler" → réservation disparaît de la liste
  - Sans réservation : message "Aucune réservation pour l'instant"
  - La navbar affiche le lien "Mes réservations" qui navigue correctement

- [ ] **Step 4: Final type-check + lint**

```bash
npm run type-check && npm run lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Booking/MyBookings.vue
git commit -m "feat: add MyBookings page"
```
