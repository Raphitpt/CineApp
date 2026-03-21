export interface Session {
  id: string
  movie_id: string
  date_time: string
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

export interface Booking {
  id: string
  user_id: string
  session_id: string
  seats: number
  created_at: string | null
  session?: Session & { movie?: Movie }
}
