# vue-project

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

### 1. Installer les dépendances

```sh
bun install
```

### 2. Variables d'environnement

Copie le fichier `.env.example` et remplis les valeurs :

```sh
cp .env.example .env
```

Les clés supabase sont ont été transmises en amont (insta)

| Variable                 | Description                   |
| ------------------------ | ----------------------------- |
| `VITE_SUPABASE_URL`      | URL du projet Supabase        |
| `VITE_SUPABASE_ANON_KEY` | Clé publique anon/publishable |

### 3. Base de données

Le projet utilise [Supabase](https://supabase.com) comme base de données. Pour initialiser la table `films`, exécute ce SQL dans **Supabase → SQL Editor** :

```sql
create table films (
  id uuid default gen_random_uuid() primary key,
  titre text not null,
  description text,
  genre text[],
  annee int,
  note float,
  duree int,
  affiche_url text,
  created_at timestamp default now()
);

-- Données de test
insert into films (titre, genre, annee, note, duree) values
  ('Inception', array['sci-fi', 'thriller'], 2010, 8.8, 148),
  ('The Dark Knight', array['action', 'thriller'], 2008, 9.0, 152),
  ('Interstellar', array['sci-fi', 'drame'], 2014, 8.6, 169);
```

### 4. Générer les types TypeScript (optionnel)

Si tu modifies le schéma Supabase, regénère les types :

```sh
bunx supabase login
bunx supabase gen types typescript --project-id ton_project_id > src/types/database.types.ts
```

### 5. Lancer le projet

```sh
bun dev
```

### Compiler pour la production

```sh
bun run build
```

### Lint avec [ESLint](https://eslint.org/)

```sh
bun lint
```
