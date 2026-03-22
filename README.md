# CinéApp

Application web de réservation de séances de cinéma.

## Lancer le projet

```sh
bun install
cp .env.example .env   # remplir les variables ci-dessous
bun dev
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé publique anon |

## Build

```sh
bun run build
```

## Stack

- **Vue 3** — Composition API & Options API
- **Pinia** — gestion d'état
- **Vue Router** — navigation et protection des routes
- **Supabase** — base de données PostgreSQL, authentification, Edge Functions
- **Tailwind CSS v4** — styles
- **TypeScript** — typage statique
- **Vite** — bundler

## Fonctionnalités

**Visiteur**
- Parcourir le catalogue de films avec filtres (catégorie) et tri (note, année, titre)
- Consulter les séances disponibles pour chaque film

**Membre (compte requis)**
- Réserver des places sur une séance
- Consulter et annuler ses réservations
- Laisser un avis noté sur un film

**Admin**
- Ajouter, modifier, supprimer des films
- Gérer les séances d'un film (date/heure, capacité)
- Modérer les avis
- Consulter toutes les réservations
- Gérer les utilisateurs et leurs rôles

## Structure des composants

```
src/
├── App.vue
├── components/
│   ├── AppNavbar.vue              # Barre de navigation (liens, auth, lien admin)
│   ├── Auth/
│   │   └── AuthModal.vue          # Modal connexion / inscription
│   ├── Movie/
│   │   ├── MovieList.vue          # Grille des films
│   │   ├── MovieFilter.vue        # Filtres et tri
│   │   ├── Movie.vue              # Carte film + détail
│   │   ├── MovieSession.vue       # Liste des séances d'un film
│   │   └── MovieReview.vue        # Avis et formulaire de note
│   ├── Booking/
│   │   ├── BookingModal.vue       # Modal de réservation d'une séance
│   │   └── MyBookings.vue         # Liste des réservations de l'utilisateur
│   └── Admin/
│       ├── AdminPanel.vue         # Page /admin avec onglets
│       ├── AdminFilmsTab.vue      # Gestion des films
│       ├── AdminMovieModal.vue    # Formulaire ajout / édition d'un film
│       ├── AdminSessionModal.vue  # Formulaire ajout / édition d'une séance
│       ├── AdminAvisTab.vue       # Modération des avis
│       ├── AdminReservationsTab.vue # Vue de toutes les réservations
│       └── AdminUsersTab.vue      # Gestion des utilisateurs et rôles
├── stores/                        # Pinia — auth, movies, bookings, reviews, admin
├── router/                        # Routes et guards (redirection si non autorisé)
├── types/                         # Types TypeScript (database.types.ts)
└── lib/                           # Client Supabase
```

## Rôles

| Rôle | Accès |
|------|-------|
| Visiteur | Consultation des films et séances |
| Membre | + Réservation, avis |
| Admin | + Panel `/admin` |

Pour promouvoir un utilisateur en admin via Supabase SQL Editor :

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'user@example.com';
```

## Edge Functions

La gestion des utilisateurs côté admin passe par une Edge Function Supabase (pour utiliser la clé service-role sans l'exposer au client).

Déploiement :

```sh
supabase functions deploy admin-users
```

## Regénérer les types Supabase

Si le schéma change :

```sh
bunx supabase gen types typescript --project-id <project_id> > src/types/database.types.ts
```
