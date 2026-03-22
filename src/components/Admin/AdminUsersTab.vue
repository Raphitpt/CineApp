<script lang="ts">
import { useAdminStore } from '@/stores/adminStore'
import { useAuthStore } from '@/stores/authStore'

export default {
  computed: {
    store() { return useAdminStore() },
    authStore() { return useAuthStore() },
  },
  async created() {
    await this.store.fetchAllUsers()
  },
  methods: {
    async toggleRole(userId: string, currentRole: 'admin' | 'member') {
      const newRole = currentRole === 'admin' ? 'member' : 'admin'
      const label = newRole === 'admin' ? 'promouvoir admin' : 'rétrograder en membre'
      if (!window.confirm(`Voulez-vous ${label} cet utilisateur ?`)) return
      await this.store.setUserRole(userId, newRole)
    },
    formatDate(d: string) {
      return new Date(d).toLocaleDateString('fr-FR')
    },
  },
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-base font-semibold text-slate-900">Utilisateurs ({{ store.users.length }})</h2>

    <p v-if="store.error" class="text-sm text-red-600">{{ store.error }}</p>
    <div v-if="store.loading" class="text-sm text-slate-400">Chargement...</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
            <th class="pb-2 font-medium">Email</th>
            <th class="pb-2 font-medium">Rôle</th>
            <th class="pb-2 font-medium">Inscrit le</th>
            <th class="pb-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in store.users" :key="user.id" class="border-b border-slate-100 hover:bg-slate-50">
            <td class="py-2 pr-4 text-slate-800">
              {{ user.email }}
              <span v-if="user.id === authStore.user?.id" class="ml-1 text-xs text-slate-400">(vous)</span>
            </td>
            <td class="py-2 pr-4">
              <span :class="user.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'"
                class="text-xs px-2 py-0.5 rounded-full font-medium">
                {{ user.role }}
              </span>
            </td>
            <td class="py-2 pr-4 text-slate-400 text-xs">{{ formatDate(user.created_at) }}</td>
            <td class="py-2">
              <button @click="toggleRole(user.id, user.role)"
                :class="user.role === 'admin' ? 'text-red-500 hover:text-red-700 border-red-200' : 'text-slate-500 hover:text-slate-800 border-slate-200'"
                class="text-xs border px-2 py-1 rounded">
                {{ user.role === 'admin' ? 'Rétrograder' : 'Promouvoir admin' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
