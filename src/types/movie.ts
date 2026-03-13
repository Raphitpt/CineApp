export interface Session {
  id: string;
  movie_id: string;
  time: string;
  capacity: number;
  booked: number;
}

export interface Movie {
  id: string;
  title: string;
  duration: number;
  category: string;
  description: string | null;
  poster_url: string | null;
  rating: number | null;
  year: number | null;
  created_at: string;
  sessions?: Session[];
}

export type MovieInsert = Omit<Movie, "id" | "created_at" | "sessions">;
export type SessionInsert = Omit<Session, "id">;
