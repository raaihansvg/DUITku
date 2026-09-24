"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/DashboardHeader'

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

export default function DashboardClient({ userName }: { userName: string }) {
  const router = useRouter()
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme(getStoredTheme())
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    saveThemeCookie(next)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader
        userName={userName}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-xl rounded-app border border-dashed border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/12 text-primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            Halo, {userName.split(' ')[0] || 'Mahasiswa'} 👋
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Autentikasi berhasil. Area transaksi, saldo, dan ringkasan keuangan
            dikerjakan oleh anggota tim lain — bagian ini fokus pada login,
            register, logout, dan preferensi tema.
          </p>
        </div>
      </main>
    </div>
  )
}
