<script lang="ts">
import { useAuthStore } from "@/stores/authStore";
import AuthModal from "@/components/Auth/AuthModal.vue";

export default {
  components: { AuthModal },
  data() {
    return { showAuthModal: false };
  },
  computed: {
    store() {
      return useAuthStore();
    },
    user() {
      return this.store.user;
    },
    isBasePath() {
      return this.$route.path === "/";
    },
  },
  methods: {
    async logout() {
      await this.store.logout();
    },
  },
};
</script>

<template>
  <header
    class="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between"
  >
    <RouterLink to="/">
      <button class="flex items-center gap-2">
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
      </button>
    </RouterLink>

    <div class="flex items-center gap-3">
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
