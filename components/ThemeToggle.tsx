type Props = {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'}
      onClick={onToggle}
      className="relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border border-border bg-muted px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* track icons */}
      <span className="pointer-events-none absolute left-2 text-[13px]" aria-hidden>
        ☀️
      </span>
      <span className="pointer-events-none absolute right-2 text-[13px]" aria-hidden>
        🌙
      </span>
      <span
        className="z-10 grid h-7 w-7 place-items-center rounded-full bg-card text-foreground shadow-sm transition-transform duration-300"
        style={{ transform: isDark ? 'translateX(28px)' : 'translateX(0)' }}
        aria-hidden
      >
        {isDark ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        )}
      </span>
    </button>
  )
}
