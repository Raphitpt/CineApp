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
