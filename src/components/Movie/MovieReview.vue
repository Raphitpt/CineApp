<script lang="ts">
import { useReviewsStore } from "@/stores/reviewStore";
import { useAuthStore } from "@/stores/authStore";
import { mapState } from "pinia";
import AuthModal from "../Auth/AuthModal.vue";

export default {
  components: { AuthModal },
  props: {
    movieId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      comment: "",
      rating: 0,
      hoverRating: 0,
      submitted: false,
      showAuthModal: false,
    };
  },

  computed: {
    ...mapState(useReviewsStore, ["reviews", "loading", "error"]),
    ...mapState(useAuthStore, ["user"]),

    averageRating(): string {
      if (!this.reviews.length) return "—";
      const avg = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
      return avg.toFixed(1);
    },

    isFormValid(): boolean {
      return this.comment.trim().length > 0 && this.rating > 0;
    },

    displayName(): string {
      if (!this.user) return "";
      return this.user.email ?? "Utilisateur anonyme";
    },
  },

  mounted() {
    const store = useReviewsStore();
    store.fetchReviews(this.movieId);
  },

  methods: {
    async submitReview() {
      if (!this.isFormValid) return;

      const store = useReviewsStore();
      await store.addReview(this.movieId, this.comment.trim(), this.rating);

      if (!store.error) {
        this.submitted = true;
        this.comment = "";
        this.rating = 0;
        setTimeout(() => (this.submitted = false), 3000);
      }
    },

    openAuthModal() {
      if (!this.user && !this.showAuthModal) {
        this.showAuthModal = true;
      }
    },

    formatDate(dateStr: string): string {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },

    ratingLabel(rating: number): string {
      if (rating >= 9) return "Chef-d'œuvre";
      if (rating >= 7) return "Excellent";
      if (rating >= 5) return "Bien";
      if (rating >= 3) return "Moyen";
      return "Pas ouf allez pas le voir";
    },

    ratingColor(rating: number): string {
      if (rating >= 8) return "text-emerald-600 bg-emerald-50";
      if (rating >= 5) return "text-amber-600 bg-amber-50";
      return "text-red-500 bg-red-50";
    },
  },
};
</script>

<template>
  <section class="mt-12">
    <h2 class="text-2xl font-bold text-slate-900 mb-1">Avis des spectateurs</h2>

    <div class="flex items-center gap-3 mb-8">
      <span class="text-5xl font-black text-slate-800">{{ averageRating }}</span>
      <div>
        <p class="text-sm text-slate-500">Note moyenne</p>
        <p class="text-xs text-slate-400">{{ reviews.length }} avis</p>
      </div>
    </div>

    <div v-if="user" class="bg-slate-50 rounded-2xl p-6 mb-10 border border-slate-200">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-slate-800">Laisser un avis</h3>
        <span class="text-sm text-slate-500">
          Connecté en tant que <strong>{{ displayName }}</strong>
        </span>
      </div>

      <div
        v-if="submitted"
        class="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3"
      >
        Votre avis a bien été publié !
      </div>

      <div
        v-if="error"
        class="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
      >
        ❌ {{ error }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Note</label>
          <div class="flex items-center gap-1">
            <button
              v-for="n in 10"
              :key="n"
              type="button"
              class="w-8 h-8 rounded-md text-sm font-semibold transition-colors duration-150"
              :class="
                n <= (hoverRating || rating)
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-400'
              "
              @click="rating = n"
              @mouseenter="hoverRating = n"
              @mouseleave="hoverRating = 0"
            >
              {{ n }}
            </button>
            <!-- Petite association entre note et ce que traduis la note -->
            <span v-if="rating" class="ml-3 text-sm text-slate-500 font-medium">
              {{ ratingLabel(rating) }}
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Commentaire</label>
          <textarea
            v-model="comment"
            rows="3"
            placeholder="Votre avis sur le film..."
            class="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white resize-none"
          />
        </div>

        <button
          :disabled="!isFormValid"
          class="bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
          @click="submitReview"
        >
          Publier l'avis
        </button>
      </div>
    </div>

    <div
      v-else
      class="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 mb-10 flex items-center justify-between gap-4"
    >
      <p class="text-sm text-slate-500">Connectez-vous pour laisser un avis sur ce film.</p>
      <button
        @click="openAuthModal"
        class="shrink-0 text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors duration-200"
      >
        Se connecter
      </button>
    </div>

    <AuthModal v-if="showAuthModal" @close="showAuthModal = false" />

    <div v-if="loading" class="text-center text-slate-400 py-8">Chargement des avis...</div>

    <div v-else-if="reviews.length === 0" class="text-slate-400 text-sm italic">
      Aucun avis pour ce film. Soyez le premier !
    </div>

    <ul v-else class="space-y-4">
      <li
        v-for="review in reviews"
        :key="review.id"
        class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-semibold text-slate-800 text-sm">{{ review.author }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ formatDate(review.created_at) }}</p>
          </div>
          <span
            class="text-sm font-bold px-3 py-1 rounded-full shrink-0"
            :class="ratingColor(review.rating)"
          >
            {{ review.rating }}/10
          </span>
        </div>
        <p class="text-sm text-slate-600 mt-3 leading-relaxed">{{ review.comment }}</p>
      </li>
    </ul>
  </section>
</template>
