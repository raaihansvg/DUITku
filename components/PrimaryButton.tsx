import type { ButtonHTMLAttributes } from 'react'

export function PrimaryButton({ children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="w-full rounded-xl bg-primary px-4 py-3 text-[0.95rem] font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-60"
      {...rest}
    >
      {children}
    </button>
  )
}
