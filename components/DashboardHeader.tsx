import { useState } from 'react'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

type Props = {
  userName: string
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onLogout: () => void
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function DashboardHeader({ userName, theme, onToggleTheme, onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo size={36} />

        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          {/* User identity + logout (desktop) */}
          <div className="hidden items-center gap-2 rounded-full border border-border bg-background py-1 pl-1.5 pr-1.5 sm:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/12 text-xs font-bold text-primary">
              {initials(userName)}
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-muted-foreground">Masuk sebagai</span>
              <span className="max-w-[10rem] truncate text-sm font-semibold text-foreground">
                {userName}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogoutIcon />
              Keluar
            </button>
          </div>

          {/* Mobile: avatar toggles a small menu */}
          <div className="relative sm:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Menu akun"
              className="grid h-9 w-9 place-items-center rounded-full bg-primary/12 text-xs font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {initials(userName)}
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-11 w-52 rounded-2xl border border-border bg-card p-2 shadow-xl"
              >
                <div className="px-2.5 py-2">
                  <p className="text-xs text-muted-foreground">Masuk sebagai</p>
                  <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <LogoutIcon />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}
