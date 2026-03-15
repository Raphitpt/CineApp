# Authentification & Réservation de séances

**Date :** 2026-03-15
**Projet :** GoOut – App cinéma Vue 3 + Pinia + Supabase

---

## Objectif

Permettre aux utilisateurs de créer un compte, se connecter, réserver une ou plusieurs places pour une séance de cinéma, et annuler leurs réservations. Le système doit empêcher la réservation si la séance est complète et afficher dynamiquement les places restantes.

---

## Architecture

### Nouveaux stores Pinia

**`src/stores/authStore.ts`**
- State : `user` (User Supabase | null), `loading`, `error`
- Actions : `initAuth()`, `login(email, password)`, `register(email, password)`, `logout()`
- `initAuth()` écoute `onAuthStateChange` Supabase — appelé dans `App.vue` au `mounted`

**`src/stores/bookingStore.ts`**
- State : `bookings` (liste des réservations de l'utilisateur), `loading`, `error`
- Actions : `fetchUserBookings()`, `book(sessionId, seats)`, `cancelBooking(bookingId)`

### Nouveaux composants

**`src/components/AppNavbar.vue`**
- Non connecté : bouton "Connexion" → ouvre `AuthModal`
- Connecté : email utilisateur + lien "Mes réservations" + bouton "Déconnexion"

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
- Page `/mes-reservations`
- Liste les réservations de l'utilisateur (film, séance, nombre de places, date)
- Bouton "Annuler" par réservation → appelle `bookingStore.cancelBooking(bookingId)`

### Modifications existantes

**`src/App.vue`** — ajout de `<AppNavbar />`

**`src/components/Movie/MovieSession.vue`** — mise à jour des cartes séance :
- Affiche les places restantes (`capacity - booked`)
- 3 états visuels :
  - Disponible → bouton "Réserver" actif, badge vert "X places restantes"
  - Déjà réservé → bouton "Annuler ma réservation", badge bleu
  - Complet → bouton désactivé, badge rouge "Complet"

**`src/router/index.ts`** — ajout route `/mes-reservations` avec navigation guard (redirige vers `/` si non connecté)

**`src/types/movie.ts`** — ajout interface `Booking`

**`src/types/database.types.ts`** — ajout table `bookings`

---

## Base de données

### Nouvelle table `bookings`

| Colonne | Type | Contrainte |
|---|---|---|
| `id` | uuid | PK, auto-généré |
| `user_id` | uuid | FK → auth.users, NOT NULL |
| `session_id` | uuid | FK → sessions, NOT NULL |
| `seats` | integer | NOT NULL, > 0 |
| `created_at` | timestamp | auto |

**Contrainte unique :** `(user_id, session_id)` — un utilisateur ne peut réserver qu'une fois par séance.

**RLS Supabase :**
- SELECT : `user_id = auth.uid()`
- INSERT : `user_id = auth.uid()`
- DELETE : `user_id = auth.uid()`

### Trigger PostgreSQL

Un trigger sur `bookings` maintient `sessions.booked` à jour :
- INSERT → incrémente `sessions.booked` du nombre de `seats`
- DELETE → décrémente `sessions.booked` du nombre de `seats`

Cela garantit la cohérence du compteur sans logique côté client.

---

## Flux utilisateur

### Réservation
1. Clic "Réserver" sur une carte séance
2. Si non connecté → `AuthModal` s'ouvre
3. Si connecté → `BookingModal` s'ouvre avec sélecteur de places
4. Confirmation → `bookingStore.book(sessionId, seats)` → insert dans `bookings`
5. Trigger incrémente `sessions.booked`
6. `MovieSession` recharge les données pour mettre à jour l'affichage

### Annulation
1. Depuis `/mes-reservations`, clic "Annuler"
2. Confirmation inline (pas de modal)
3. `bookingStore.cancelBooking(bookingId)` → delete dans `bookings`
4. Trigger décrémente `sessions.booked`
5. Liste mise à jour localement

---

## Gestion des erreurs

- Tentative de réservation sur une séance complète → bouton désactivé côté UI (contrôle préventif)
- Erreur Supabase (réseau, RLS) → message d'erreur affiché dans le modal concerné
- Accès à `/mes-reservations` sans être connecté → redirection vers `/`

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
