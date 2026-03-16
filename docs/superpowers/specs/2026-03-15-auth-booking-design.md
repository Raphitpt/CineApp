# Authentification & Réservation de séances

**Date :** 2026-03-15
**Projet :** GoOut – App cinéma Vue 3 + Pinia + Supabase

---

## Objectif

Permettre aux utilisateurs de créer un compte, se connecter, réserver une ou plusieurs places pour une séance de cinéma, et annuler leurs réservations. Le système doit empêcher la réservation si la séance est complète et afficher dynamiquement les places restantes.

---

## Architecture

### Nouveaux stores Pinia (Composition API — cohérent avec `movieStore.ts`)

**`src/stores/authStore.ts`**
- `user` ref (User Supabase | null), `loading` ref, `error` ref, `authReady` ref (boolean)
- `initAuth()` : écoute `onAuthStateChange` Supabase, met `authReady = true` une fois la session initiale résolue. Retourne la subscription pour pouvoir l'unsubscribe dans `App.vue` au `beforeUnmount`.
- `login(email, password)`, `register(email, password)`, `logout()`

**`src/stores/bookingStore.ts`**
- `bookings` ref, `loading` ref, `error` ref
- `fetchUserBookings()`, `book(sessionId, seats)`, `cancelBooking(bookingId)`
- Après `book()` réussi : appelle `movieStore.fetchMovieDetails(movieId)` pour recharger les compteurs de séances. `book()` accepte un troisième paramètre `movieId: string` pour cela.
- Après `cancelBooking()` réussi : met à jour `bookings` localement (splice)

### Nouveaux composants

**`src/components/AppNavbar.vue`**
- Non connecté : bouton "Connexion" → ouvre `AuthModal`
- Connecté : email utilisateur + lien `<RouterLink to="/mes-reservations">` + bouton "Déconnexion"

**`src/components/Auth/AuthModal.vue`**
- Modal avec toggle "Connexion" / "Inscription"
- Champs : email, mot de passe (+ confirmation en mode inscription)
- Erreurs inline (ex: "Email déjà utilisé", "Mot de passe incorrect")
- Fermeture automatique après succès

**`src/components/Booking/BookingModal.vue`**
- S'ouvre au clic sur "Réserver" d'une séance
- Sélecteur de places : 1 → places restantes (`capacity - booked`)
- Confirmation → appelle `bookingStore.book(sessionId, seats)`
- Si non connecté, ouvre `AuthModal` à la place

**`src/components/Booking/MyBookings.vue`**
- Rendu via `<RouterView>` sur la route `/mes-reservations`
- Liste les réservations de l'utilisateur (film, séance, nombre de places, date)
- Bouton "Annuler" par réservation → appelle `bookingStore.cancelBooking(bookingId)`
- Amender une réservation est hors scope : l'utilisateur doit annuler puis re-réserver

### Modifications existantes

**`src/App.vue`**
- L'élément `<header>` existant est remplacé par `<AppNavbar />`
- `mounted` : `const authStore = useAuthStore()` puis `this.authSubscription = authStore.initAuth()`
- `beforeUnmount` : `this.authSubscription?.unsubscribe()`
- `data()` expose `authSubscription: null` pour stocker la subscription

**`src/components/Movie/MovieSession.vue`** — mise à jour des cartes séance :
- Affiche les places restantes (`capacity - booked`)
- 3 états visuels :
  - Disponible → bouton "Réserver" actif, badge vert "X places restantes"
  - Déjà réservé par l'utilisateur courant → bouton "Annuler ma réservation", badge bleu
  - Complet (`booked >= capacity`) → bouton désactivé, badge rouge "Complet"

**`src/router/index.ts`**
- Ajout route `/mes-reservations` → composant `MyBookings`
- Navigation guard : attend `authStore.authReady === true` (via `watch` ou `await`) avant d'évaluer `authStore.user`. Si `user` est null → redirige vers `/`.

**`src/types/movie.ts`** — ajout interface `Booking`

**`src/types/database.types.ts`** — ajout table `bookings` (voir section Types)

---

## Base de données

### Nouvelle table `bookings`

| Colonne | Type | Contrainte |
|---|---|---|
| `id` | uuid | PK, auto-généré |
| `user_id` | uuid | FK → auth.users, NOT NULL |
| `session_id` | uuid | FK → sessions, NOT NULL |
| `seats` | integer | NOT NULL, CHECK (seats > 0) |
| `created_at` | timestamp | auto |

**Contrainte unique :** `(user_id, session_id)` — un utilisateur ne peut réserver qu'une fois par séance. Pour modifier le nombre de places, il doit annuler et re-réserver.

**Contrainte de capacité (niveau DB) :** La table `sessions` doit avoir `CHECK (booked <= capacity)` pour éviter les race conditions entre utilisateurs concurrents. Si deux utilisateurs réservent simultanément, la contrainte DB rejette la seconde insertion et retourne une erreur gérée côté client.

**RLS Supabase :**
- SELECT : `user_id = auth.uid()`
- INSERT : `user_id = auth.uid()`
- DELETE : `user_id = auth.uid()`
- UPDATE : bloqué (pas de politique UPDATE)

### Trigger PostgreSQL

Un trigger `AFTER INSERT OR DELETE ON bookings FOR EACH ROW` maintient `sessions.booked` à jour :
- `AFTER INSERT` → `UPDATE sessions SET booked = booked + NEW.seats WHERE id = NEW.session_id`
- `AFTER DELETE` → `UPDATE sessions SET booked = booked - OLD.seats WHERE id = OLD.session_id`

Note : le trigger utilise `NEW.seats` (insert) et `OLD.seats` (delete) — la valeur de places provient toujours de la ligne insérée ou supprimée.

---

## Flux utilisateur

### Réservation
1. Clic "Réserver" sur une carte séance
2. Si non connecté → `AuthModal` s'ouvre
3. Si connecté → `BookingModal` s'ouvre avec sélecteur de places
4. Confirmation → `bookingStore.book(sessionId, seats)` → insert dans `bookings`
5. Trigger incrémente `sessions.booked`
6. `bookingStore.book()` appelle `movieStore.fetchMovieDetails()` pour rafraîchir l'affichage

### Annulation
1. Depuis `/mes-reservations`, clic "Annuler"
2. Confirmation inline (pas de modal)
3. `bookingStore.cancelBooking(bookingId)` → delete dans `bookings`
4. Trigger décrémente `sessions.booked`
5. Réservation supprimée localement du tableau `bookings`

---

## Gestion des erreurs

- Séance complète (`booked >= capacity`) → bouton désactivé côté UI (contrôle préventif)
- Race condition (deux utilisateurs simultanés) → contrainte `CHECK (booked <= capacity)` sur `sessions` rejette l'insert → erreur Supabase capturée et affichée dans `BookingModal`
- Erreur Supabase (réseau, RLS) → message d'erreur affiché dans le modal concerné
- Accès à `/mes-reservations` sans être connecté → redirection vers `/` (après résolution de `authReady`)

---

## Types TypeScript

```ts
// À ajouter dans src/types/movie.ts
export interface Booking {
  id: string
  user_id: string
  session_id: string
  seats: number
  created_at: string
  session?: Session & { movie?: Movie }
}
```

```ts
// À ajouter dans src/types/database.types.ts (dans public.Tables)
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
