export interface Session {
  id: string
  movie_id: string
  time: string
  capacity: number
  booked: number
}

export interface Movie {
  id: string
  title: string
  duration: number
  category: string
  description?: string
  poster_url?: string
  rating?: number
  year?: number
  created_at: string
  sessions?: Session[]
}

export type MovieInsert = Omit<Movie, 'id' | 'created_at' | 'sessions'>
export type SessionInsert = Omit<Session, 'id'>
