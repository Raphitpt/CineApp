<script setup lang="ts">
import { onMounted } from "vue";
import { useFilmsStore } from "./stores/filmStore";

const store = useFilmsStore();
onMounted(() => store.fetchFilms());
</script>

<template>
  <section class="max-w-7xl mx-auto px-5 py-10">
    <header class="text-center mb-10">
      <h1 class="text-4xl font-bold text-slate-900">Nos films</h1>
      <p class="text-slate-500 mt-2">{{ store.films.length }} films disponibles</p>
    </header>

    <div v-if="store.loading" class="text-center text-slate-400 mt-20">Chargement...</div>

    <p v-else-if="store.error" class="text-center text-red-500 mt-20">Erreur : {{ store.error }}</p>

    <div
      v-else-if="store.films.length > 0"
      class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 mt-6"
    >
      <div
        v-for="film in store.films"
        :key="film.id"
        class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
      >
        <img
          v-if="film.affiche_url"
          :src="film.affiche_url"
          :alt="film.titre"
          class="w-full h-56 object-cover"
        />
        <div
          v-else
          class="w-full h-56 bg-slate-100 flex items-center justify-center text-slate-400 text-sm"
        >
          Pas d'affiche
        </div>

        <div class="p-4">
          <h2 class="text-lg font-semibold text-slate-800 truncate">{{ film.titre }}</h2>

          <div class="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <span>{{ film.annee }}</span>
            <span>·</span>
            <span>{{ film.duree }} min</span>
            <span>·</span>
            <span class="text-yellow-500 font-medium">⭐ {{ film.note }}</span>
          </div>

          <div class="flex flex-wrap gap-1 mt-3">
            <span
              v-for="g in film.genre"
              :key="g"
              class="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5"
            >
              {{ g }}
            </span>
          </div>

          <p v-if="film.description" class="text-sm text-slate-500 mt-3 line-clamp-2">
            {{ film.description }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="text-center mt-20 text-slate-400 text-lg">Aucun film disponible.</div>
  </section>
</template>
