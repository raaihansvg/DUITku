import type { ReactNode } from 'react'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

type Props = {
  title: string
  subtitle: string
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  children: ReactNode
}

export function AuthShell({ title, subtitle, theme, onToggleTheme, children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background px-5 py-6">
      {/* soft accent glows */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between">
        <Logo />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 text-center">
            <h1
              className="text-[1.7rem] font-extrabold leading-tight tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-app border border-border bg-card p-6 shadow-[0_8px_30px_-12px_rgba(15,42,37,0.18)] sm:p-7">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
