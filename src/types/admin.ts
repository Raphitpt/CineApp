import type { Booking } from './movie'

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'member'
  created_at: string
}

export interface BookingWithDetails extends Booking {
  user_email?: string
}
