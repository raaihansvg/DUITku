"use client"
import { useState, type FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthShell } from '@/components/AuthShell'
import { Field } from '@/components/Field'
import { PrimaryButton } from '@/components/PrimaryButton'
import { ErrorBanner } from '@/components/ErrorBanner'

type Theme = 'light' | 'dark'

export default function LoginPage() {
  const router = useRouter()
  const [theme, setTheme] = useState<Theme>('light')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.')
      return
    }
        
    if (email.trim().toLowerCase() === 'naufal@kampus.ac.id' && password === 'duitku123') {
      setError(null)
      router.push('/dashboard')
      return
    }
    setError('Email atau password salah.')
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
        <PrimaryButton type="submit">Masuk</PrimaryButton>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Belum punya akun?{' '}
        <Link
          href="/register"
          className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Daftar di sini
        </Link>
      </p>

      <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
        Demo: <span className="font-medium text-foreground">naufal@kampus.ac.id</span> / <span className="font-medium text-foreground">duitku123</span>
      </p>
    </AuthShell>
  )
}
