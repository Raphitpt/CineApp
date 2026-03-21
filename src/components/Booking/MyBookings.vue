<script lang="ts">
import { useBookingStore } from "@/stores/bookingStore";
import { mapState } from "pinia";

export default {
  data() {
    return {
      cancellingBookingId: null as string | null,
    };
  },
  computed: {
    ...mapState(useBookingStore, ["bookings", "loading", "error"]),
  },
  mounted() {
    useBookingStore().fetchUserBookings();
  },
  methods: {
    async cancel(bookingId: string) {
      const deleteOk = await useBookingStore().cancelBooking(bookingId);
      if (deleteOk) {
        this.cancellingBookingId = null;
      }
    },
    formatDate(dateStr: string) {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },
  },
};
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-slate-900 mb-6">Mes réservations</h1>

    <div v-if="loading" class="text-slate-400 text-sm">Chargement...</div>
    <p v-else-if="error" class="text-red-500 text-sm">Erreur : {{ error }}</p>

    <div v-else-if="bookings.length === 0" class="text-slate-400 text-sm">
      Aucune réservation pour l'instant.
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="booking in bookings"
        :key="booking.id"
        class="flex items-center justify-between gap-4 border border-slate-200 rounded-2xl p-4"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-900 truncate">
            {{ booking.session?.movie?.title ?? "—" }}
          </p>
          <p class="text-xs text-slate-500 mt-0.5">
            Séance {{ booking.session?.date_time ?? "—" }} · {{ booking.seats }} place{{
              booking.seats > 1 ? "s" : ""
            }}
          </p>
          <p class="text-xs text-slate-400 mt-0.5">
            Réservé le {{ formatDate(booking.created_at ?? "") }}
          </p>
        </div>
        <div v-if="cancellingBookingId === booking.id">
          <button
            @click="cancel(booking.id)"
            class="shrink-0 text-xs text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            Confirmer
          </button>
          <button
            @click="cancellingBookingId = null"
            class="text-xs text-slate-400 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <button
          v-else
          @click="cancellingBookingId = booking.id"
          class="shrink-0 text-xs text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>
