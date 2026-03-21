# CinéApp

Application web de réservation de séances de cinéma.

## Fonctionnalités

- Parcourir le catalogue de films avec filtres et tri
- Consulter les séances disponibles par film
- Réserver des places (compte requis)
- Gérer ses réservations
- Laisser un avis sur les films
- Panel d'administration pour gérer le contenu

## Stack

- **Vue 3** — Composition API & Options API
- **Pinia** — gestion d'état
- **Vue Router** — navigation et protection des routes
- **Supabase** — base de données PostgreSQL, authentification, Edge Functions
- **Tailwind CSS v4** — styles
- **TypeScript** — typage statique
- **Vite** — bundler

## Installation

```sh
bun install
```

Copier le fichier `.env.example` et remplir les valeurs :

```sh
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé publique anon |

## Développement

```sh
bun dev
```

## Build

```sh
bun run build
```

## Structure

```
src/
├── components/
│   ├── Admin/        # Panel d'administration
│   ├── Auth/         # Connexion / inscription
│   ├── Booking/      # Réservation et mes réservations
│   └── Movie/        # Liste des films et séances
├── stores/           # Pinia (auth, films, réservations, avis, admin)
├── router/           # Routes et guards
├── types/            # Types TypeScript
└── lib/              # Client Supabase
```

## Rôles

| Rôle | Accès |
|------|-------|
| Visiteur | Consultation des films et séances |
| Membre | + Réservation, avis |
| Admin | + Panel `/admin` |

Pour promouvoir un utilisateur admin via Supabase SQL Editor :

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'user@example.com';
```

## Edge Functions

```sh
supabase functions deploy admin-users
```

## Types Supabase

Si le schéma change, regénérer les types :

```sh
bunx supabase gen types typescript --project-id <project_id> > src/types/database.types.ts
```
