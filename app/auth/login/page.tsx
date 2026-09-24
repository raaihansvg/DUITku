"use client"
import { useState, type FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthShell } from '@/components/AuthShell'
import { Field } from '@/components/Field'
import { PrimaryButton } from '@/components/PrimaryButton'
import { ErrorBanner } from '@/components/ErrorBanner'

type Theme = 'light' | 'dark'

const THEME_COOKIE = 'duitku_theme'

function getStoredTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  const match = document.cookie.match(/duitku_theme=(light|dark)/)
  return (match?.[1] as Theme) ?? 'light'
}

function saveThemeCookie(theme: Theme) {
  // Expire 1 tahun
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${THEME_COOKIE}=${theme}; expires=${expires}; path=/; SameSite=Lax`
}

export default function LoginPage() {
  const router = useRouter()
  const [theme, setTheme] = useState<Theme>('light')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = getStoredTheme()
    setTheme(stored)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    saveThemeCookie(next)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login gagal.')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Tidak dapat terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Masuk ke DUITku"
      subtitle="Selamat datang kembali! Yuk lanjut atur keuanganmu."
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <ErrorBanner message={error} />
        <Field
          label="Email"
          type="email"
          placeholder="nama@kampus.ac.id"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          type="password"
          placeholder="Masukkan password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Masuk'}
        </PrimaryButton>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Belum punya akun?{' '}
        <Link
          href="/auth/register"
          className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Daftar di sini
        </Link>
      </p>
    </AuthShell>
  )
}
