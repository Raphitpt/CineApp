export interface Film {
  id: string;
  titre: string;
  description: string | null;
  genre: string[];
  annee: number;
  note: number;
  duree: number;
  affiche_url: string | null;
  created_at: string;
}

export type FilmInsert = Omit<Film, "id" | "created_at">;

export interface Filtres {
  recherche: string;
  genre: string | null;
  anneeMin: number | null;
  anneeMax: number | null;
  noteMin: number | null;
}
