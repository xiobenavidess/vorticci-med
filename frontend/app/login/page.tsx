'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth.store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch {
      setError('Email o contraseña incorrectos')
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-[#1D9E75] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            Vorticci <span className="text-[#1D9E75]">Med</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#111816] border border-white/10 rounded-2xl p-8">
          <h1 className="text-white text-2xl font-bold mb-1">Bienvenida</h1>
          <p className="text-white/50 text-sm mb-8">Ingresa a tu cuenta para continuar</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[#5DCAA5] text-xs font-semibold uppercase tracking-widest mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@clinica.com"
                required
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#1D9E75] focus:bg-white/8 transition-all"
              />
            </div>

            <div>
              <label className="text-[#5DCAA5] text-xs font-semibold uppercase tracking-widest mb-2 block">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#1D9E75] focus:bg-white/8 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1D9E75] hover:bg-[#25B587] active:bg-[#0F6E56] disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all mt-1 text-sm"
            >
              {loading ? 'Ingresando...' : 'Ingresar →'}
            </button>
          </form>
        </div>

        <p className="text-white/20 text-xs text-center mt-6">
          Vorticci Med · Sistema operativo para centros médicos
        </p>
      </div>
    </div>
  )
}