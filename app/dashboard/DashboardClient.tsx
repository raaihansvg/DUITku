"use client"
import { useState, useEffect, type ReactNode } from 'react'
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

export default function DashboardClient({
  userName,
  children,
}: {
  userName: string
  children: ReactNode
}) {
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

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          Halo, {userName.split(' ')[0] || 'Mahasiswa'} 👋
        </h2>
        {children}
      </main>
    </div>
  )
}
