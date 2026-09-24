import { useState, type FormEvent } from 'react'
import { AuthShell } from './AuthShell'
import { Field } from './Field'
import { PrimaryButton } from './PrimaryButton'
import { ErrorBanner } from './ErrorBanner'

type Props = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onRegister: (name: string) => void
  onGoLogin: () => void
}

export function RegisterPage({ theme, onToggleTheme, onRegister, onGoLogin }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      setError('Semua kolom wajib diisi.')
      return
    }
    // Demo: simulate a taken email so the error area is visible.
    if (email.trim().toLowerCase() === 'terdaftar@duitku.id') {
      setError('Email sudah terdaftar.')
      return
    }
    setError(null)
    onRegister(name.trim())
  }

  return (
    <AuthShell
      title="Daftar Akun DUITku"
      subtitle="Kelola uang jajan & pengeluaran kuliah dengan rapi."
      theme={theme}
      onToggleTheme={onToggleTheme}
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
        <PrimaryButton type="submit">Daftar</PrimaryButton>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <button
          type="button"
          onClick={onGoLogin}
          className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Masuk di sini
        </button>
      </p>
    </AuthShell>
  )
}
