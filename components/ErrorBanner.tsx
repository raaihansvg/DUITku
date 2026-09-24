export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2.5 rounded-xl border border-danger-border bg-danger-soft px-3.5 py-3 text-sm text-danger"
    >
      <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <span className="font-medium">{message}</span>
    </div>
  )
}
