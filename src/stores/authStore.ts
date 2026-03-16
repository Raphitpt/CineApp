import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authReady = ref(false)

  function initAuth() {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
      authReady.value = true
    })
    return subscription
  }

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    loading.value = false
    if (err) { error.value = err.message; return false }
    return true
  }

  async function register(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    const { error: err } = await supabase.auth.signUp({ email, password })
    loading.value = false
    if (err) { error.value = err.message; return false }
    return true
  }

  async function logout(): Promise<void> {
    error.value = null
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, loading, error, authReady, initAuth, login, register, logout }
})
