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
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${THEME_COOKIE}=${theme}; expires=${expires}; path=/; SameSite=Lax`
}

export default function RegisterPage() {
  const router = useRouter()
  const [theme, setTheme] = useState<Theme>('light')
  const [name, setName] = useState('')
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
    if (!name.trim() || !email.trim() || !password) {
      setError('Semua kolom wajib diisi.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Pendaftaran gagal.')
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
      title="Daftar Akun DUITku"
      subtitle="Kelola uang jajan & pengeluaran kuliah dengan rapi."
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <ErrorBanner message={error} />
        <Field
          label="Nama Lengkap"
          placeholder="Naufal Ramadhan"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          hint="Gunakan kombinasi huruf dan angka."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? 'Mendaftar...' : 'Daftar'}
        </PrimaryButton>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <Link
          href="/auth/login"
          className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Masuk di sini
        </Link>
      </p>
    </AuthShell>
  )
}
