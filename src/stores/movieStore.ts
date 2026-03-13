// src/stores/movieStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabase";
import type { Movie } from "@/types/movie";

export const useMoviesStore = defineStore("movies", () => {
  const movies = ref<Movie[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  async function fetchMovies(): Promise<void> {
    loading.value = true;
    error.value = null;

    const { data, error: err } = await supabase
      .from("movies")
      .select("*, sessions(*)")
      .order("title");

    if (err) error.value = err.message;
    else movies.value = data as Movie[];

    loading.value = false;
  }

  return { movies, loading, error, fetchMovies };
});
