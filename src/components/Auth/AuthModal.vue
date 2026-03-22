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
