<script lang="ts">
import AdminFilmsTab from './AdminFilmsTab.vue'
import AdminAvisTab from './AdminAvisTab.vue'
import AdminReservationsTab from './AdminReservationsTab.vue'
import AdminUsersTab from './AdminUsersTab.vue'

const TABS = ['Films', 'Avis', 'Réservations', 'Utilisateurs'] as const
type Tab = typeof TABS[number]

export default {
  components: { AdminFilmsTab, AdminAvisTab, AdminReservationsTab, AdminUsersTab },
  data() {
    return { activeTab: 'Films' as Tab }
  },
  computed: {
    tabs() { return TABS },
  },
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-8">
    <h1 class="text-xl font-semibold text-slate-900 mb-6">Administration</h1>

    <div class="flex gap-1 border-b border-slate-200 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        :class="[
          'px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors',
          activeTab === tab
            ? 'border-slate-900 text-slate-900'
            : 'border-transparent text-slate-500 hover:text-slate-800',
        ]"
      >
        {{ tab }}
      </button>
    </div>

    <AdminFilmsTab v-if="activeTab === 'Films'" />
    <AdminAvisTab v-if="activeTab === 'Avis'" />
    <AdminReservationsTab v-if="activeTab === 'Réservations'" />
    <AdminUsersTab v-if="activeTab === 'Utilisateurs'" />
  </div>
</template>
