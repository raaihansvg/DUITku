'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/DashboardHeader'
import { type Theme, THEME_COOKIE, THEME_MAX_AGE } from '@/lib/theme'

/**
 * Tulis cookie preferensi tema di browser.
 * Dibaca kembali oleh server (layout.tsx) saat navigasi berikutnya
 * sehingga class 'dark' langsung ada di <html> tanpa kedipan.
 */
function saveThemeCookie(theme: Theme) {
  const expires = new Date(Date.now() + THEME_MAX_AGE * 1000).toUTCString()
  document.cookie = `${THEME_COOKIE}=${theme}; expires=${expires}; path=/; SameSite=Lax`
}

export default function DashboardClient({
  userName,
  initialTheme,
  children,
}: {
  userName: string
  initialTheme: Theme
  children: ReactNode
}) {
  const router = useRouter()

  // Inisialisasi dari nilai server — tidak ada kedipan (FOUC)
  const [theme, setTheme] = useState<Theme>(initialTheme)

  // Sinkronkan class 'dark' di <html> setiap kali tema berubah di klien
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
        <h2
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Halo, {userName.split(' ')[0] || 'Mahasiswa'} 👋
        </h2>
        {children}
      </main>
    </div>
  )
}
