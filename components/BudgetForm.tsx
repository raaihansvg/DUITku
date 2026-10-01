'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { budgetSchema, type BudgetFormValues } from '@/app/lib/validations/budget'
import { useState } from 'react'
import { X } from 'lucide-react'

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

interface BudgetFormProps {
  defaultMonth: number
  defaultYear: number
  defaultAmount?: number
  /** Jika ada, mode edit (PATCH). Jika tidak ada, mode tambah (POST). */
  budgetId?: number
  onSuccess: () => void
  onCancel: () => void
}

export function BudgetForm({
  defaultMonth,
  defaultYear,
  defaultAmount,
  budgetId,
  onSuccess,
  onCancel,
}: BudgetFormProps) {
  const isEdit = !!budgetId
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<BudgetFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: {
      month: defaultMonth,
      year: defaultYear,
      amount: defaultAmount ?? ('' as unknown as number),
    },
  })

  async function onSubmit(data: BudgetFormValues) {
    setServerError(null)

    const url = isEdit ? `/api/budget/${budgetId}` : '/api/budget'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json = await res.json()
      setServerError(
        typeof json.error === 'string' ? json.error : 'Terjadi kesalahan. Coba lagi.'
      )
      return
    }

    onSuccess()
  }

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-form-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 id="budget-form-title" className="font-semibold text-foreground">
            {isEdit ? 'Ubah Budget' : 'Tetapkan Budget'}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error server */}
        {serverError && (
          <p className="mb-4 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Bulan & Tahun */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="budget-month"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Bulan
              </label>
              <select
                id="budget-month"
                {...form.register('month', { valueAsNumber: true })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
              {form.formState.errors.month && (
                <p className="mt-1 text-xs text-danger">
                  {form.formState.errors.month.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="budget-year"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Tahun
              </label>
              <input
                id="budget-year"
                type="number"
                {...form.register('year', { valueAsNumber: true })}
                min={2000}
                max={2100}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {form.formState.errors.year && (
                <p className="mt-1 text-xs text-danger">
                  {form.formState.errors.year.message}
                </p>
              )}
            </div>
          </div>

          {/* Nominal */}
          <div>
            <label
              htmlFor="budget-amount"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Nominal Budget (Rp)
            </label>
            <input
              id="budget-amount"
              type="number"
              {...form.register('amount', { valueAsNumber: true })}
              placeholder="1000000"
              min={1}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {form.formState.errors.amount && (
              <p className="mt-1 text-xs text-danger">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
