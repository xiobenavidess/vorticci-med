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
    const rol = useAuthStore.getState().usuario?.rol
    router.push(rol === 'PACIENTE' ? '/paciente' : '/dashboard')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0F1117',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, background: '#1D9E75', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>V</span>
          </div>
          <div>
            <div style={{ color: '#E6EDF3', fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
              Vorticci <span style={{ color: '#1D9E75' }}>Med</span>
            </div>
            <div style={{ color: '#8B949E', fontSize: 12 }}>Sistema médico</div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 16, padding: '28px 24px' }}>
          <h1 style={{ color: '#E6EDF3', fontSize: 24, fontWeight: 700, margin: '0 0 4px 0' }}>Bienvenida</h1>
          <p style={{ color: '#8B949E', fontSize: 14, margin: '0 0 28px 0' }}>Ingresa a tu cuenta para continuar</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', color: '#1D9E75', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@clinica.com"
                required
                style={{ width: '100%', background: '#0D1117', border: '1px solid #30363D', borderRadius: 10, padding: '14px 16px', color: '#E6EDF3', fontSize: 16, outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none' }}
                onFocus={e => e.target.style.borderColor = '#1D9E75'}
                onBlur={e => e.target.style.borderColor = '#30363D'}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#1D9E75', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', background: '#0D1117', border: '1px solid #30363D', borderRadius: 10, padding: '14px 16px', color: '#E6EDF3', fontSize: 16, outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none' }}
                onFocus={e => e.target.style.borderColor = '#1D9E75'}
                onBlur={e => e.target.style.borderColor = '#30363D'}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(194,74,74,0.12)', border: '1px solid rgba(194,74,74,0.4)', borderRadius: 10, padding: '12px 16px', color: '#C46A6A', fontSize: 14, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: loading ? '#144d3a' : '#1D9E75', color: '#fff', fontWeight: 700, fontSize: 16, padding: '16px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, transition: 'background 0.2s' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar →'}
            </button>
          </form>
        </div>

        <p style={{ color: '#484F58', fontSize: 12, textAlign: 'center', marginTop: 24 }}>
          Vorticci Med · Sistema operativo para centros médicos
        </p>
      </div>
    </div>
  )
}
