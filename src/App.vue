<script lang="ts">
export default {
  computed: {
    isBasePath() {
      return this.$route.path === "/";
    },
  },
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header
      class="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="3" />
          <path d="M8 4v16M16 4v16M2 9h3M19 9h3M2 15h3M19 15h3" />
        </svg>
        <span class="text-sm font-medium text-slate-900">CinéApp</span>
      </div>

      <RouterLink
        v-if="!isBasePath"
        to="/"
        class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Retour aux films
      </RouterLink>
    </header>

    <main class="flex-1 bg-slate-50 py-8 px-5">
      <div class="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
