'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { TransactionForm } from '@/components/TransactionsForm'
import type { TransactionFormValues } from '@/app/lib/validations/transactions'

interface TransactionFormModalProps {
  /** Jika ada, mode edit (PATCH). Jika tidak ada, mode tambah (POST). */
  transactionId?: number
  initialData?: TransactionFormValues
  onSuccess: () => void
  onCancel: () => void
}

export function TransactionFormModal({
  transactionId,
  initialData,
  onSuccess,
  onCancel,
}: TransactionFormModalProps) {
  const isEdit = transactionId !== undefined
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel, saving])

  async function handleSubmit(data: TransactionFormValues) {
    setSaving(true)
    setServerError(null)
    try {
      const res = await fetch(isEdit ? `/api/transactions/${transactionId}` : '/api/transactions', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(typeof json.error === 'string' ? json.error : 'Gagal menyimpan transaksi.')
      }
      onSuccess()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-form-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 id="transaction-form-title" className="font-semibold text-foreground">
            {isEdit ? 'Ubah Transaksi' : 'Tambah Transaksi'}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {serverError && (
          <p role="alert" className="mb-4 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}

        <TransactionForm initialData={initialData} onSubmit={handleSubmit} isLoading={saving} />
      </div>
    </div>
  )
}
