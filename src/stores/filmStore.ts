// src/stores/filmStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabase";
import type { Film } from "@/types/film";

export const useFilmsStore = defineStore("films", () => {
  const films = ref<Film[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  async function fetchFilms(): Promise<void> {
    loading.value = true;
    error.value = null;

    const { data, error: err } = await supabase.from("films").select("*").order("titre");

    if (err) error.value = err.message;
    else films.value = data as Film[];

    loading.value = false;
  }

  return { films, loading, error, fetchFilms };
});
