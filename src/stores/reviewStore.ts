import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabase";
import type { Review } from "@/types/review";

export const useReviewsStore = defineStore("reviews", () => {
  const reviews = ref<Review[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  async function fetchReviews(movieId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    const { data, error: err } = await supabase
      .from("reviews")
      .select("*")
      .eq("movie_id", movieId)
      .order("created_at", { ascending: false });

    if (err) error.value = err.message;
    else reviews.value = data as Review[];

    loading.value = false;
  }

  async function addReview(movieId: string, comment: string, rating: number): Promise<void> {
    error.value = null;

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      error.value = "Vous devez être connecté pour poster un avis.";
      return;
    }

    const user = session.user;
    const author =
      user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? "Anonyme";

    const { data, error: err } = await supabase
      .from("reviews")
      .insert({
        movie_id: movieId,
        user_id: user.id,
        author,
        comment,
        rating,
      })
      .select()
      .single();

    if (err) error.value = err.message;
    else reviews.value.unshift(data as Review);
  }

  return { reviews, loading, error, fetchReviews, addReview };
});
