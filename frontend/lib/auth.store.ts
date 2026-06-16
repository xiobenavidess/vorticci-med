import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from './api'

interface Usuario {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: string
  centro: { id: string; nombre: string } | null
}

interface AuthStore {
  usuario: Usuario | null
  token: string | null
  loading: boolean
  init: () => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      loading: false,

      init: () => {
        const token = localStorage.getItem('access_token')
        if (token) set({ token })
      },

      login: async (email, password) => {
        set({ loading: true })
        try {
          const data = await api.post('/auth/login', { email, password })
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          set({ usuario: data.usuario, token: data.access_token, loading: false })
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      logout: async () => {
        const refresh = localStorage.getItem('refresh_token')
        await api.post('/auth/logout', { refresh_token: refresh }).catch(() => {})
        localStorage.clear()
        set({ usuario: null, token: null })
        window.location.href = '/login'
      },
    }),
    {
      name: 'vorticci-auth',
      partialize: (s) => ({ usuario: s.usuario, token: s.token }),
    },
  ),
)