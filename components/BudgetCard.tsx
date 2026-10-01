'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingDown, AlertTriangle, CheckCircle2, RefreshCw, Trash2, PencilLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BudgetForm } from './BudgetForm'

// ─── Types ────────────────────────────────────────────────────────────────────

type Budget = {
  id: number
  month: number
  year: number
  amount: string
}

type BudgetData = {
  budget: Budget | null
  used: number
  remaining: number | null
  percentage: number | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * BudgetCard
 *
 * Komponen klien yang memuat data budget via AJAX (fetch ke /api/budget).
 * Mendengarkan event 'transaction:changed' yang dikirim oleh komponen
 * transaksi (SRS-008, dikerjakan Aji) untuk memperbarui data secara otomatis
 * setelah transaksi pengeluaran ditambah, diubah, atau dihapus.
 */
export function BudgetCard() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<BudgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // ── Fetch data budget via AJAX ─────────────────────────────────────────────
  const fetchBudget = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/budget?month=${month}&year=${year}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Gagal memuat data budget.')
      }
      setData(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  // Muat ulang saat bulan/tahun berubah
  useEffect(() => {
    fetchBudget()
  }, [fetchBudget])

  // Dengarkan event dari komponen transaksi (SRS-008 — dikerjakan Aji)
  // Saat Aji selesai mengimplementasikan AJAX transaksi, ia cukup dispatch:
  //   window.dispatchEvent(new Event('transaction:changed'))
  useEffect(() => {
    const handler = () => fetchBudget()
    window.addEventListener('transaction:changed', handler)
    return () => window.removeEventListener('transaction:changed', handler)
  }, [fetchBudget])

  // ── Hapus budget ───────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!data?.budget) return
    if (!confirm('Hapus budget bulan ini? Data tidak bisa dipulihkan.')) return

    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/budget/${data.budget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Gagal menghapus budget.')
      }
      await fetchBudget()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setDeleting(false)
    }
  }

  // ── Turunkan nilai untuk UI ────────────────────────────────────────────────
  const pct = data?.percentage ?? 0
  const isExceeded = pct > 100
  const isWarning = pct >= 80 && !isExceeded

  const barColor = isExceeded
    ? 'bg-danger'
    : isWarning
      ? 'bg-yellow-500'
      : 'bg-primary'

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">

        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" aria-hidden />
            <h3 className="font-semibold text-foreground">Budget Bulanan</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Pilih bulan */}
            <select
              aria-label="Pilih bulan"
              className="rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>

            {/* Pilih tahun */}
            <input
              aria-label="Tahun"
              type="number"
              className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={year}
              min={2000}
              max={2100}
              onChange={(e) => setYear(Number(e.target.value))}
            />

            {/* Tombol muat ulang */}
            <button
              type="button"
              onClick={fetchBudget}
              disabled={loading}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Muat ulang data budget"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <p className="mb-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {/* Loading state */}
        {loading && !data ? (
          <div className="flex h-28 items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>

        ) : data?.budget ? (
          <>
            {/* Peringatan */}
            {isExceeded && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Budget bulan ini telah terlampaui!
              </div>
            )}
            {isWarning && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-yellow-50 px-3 py-2.5 text-sm font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Penggunaan mendekati batas ({pct}%)
              </div>
            )}
            {!isWarning && !isExceeded && pct > 0 && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Pengeluaran masih dalam batas budget
              </div>
            )}

            {/* Ringkasan tiga angka */}
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="mt-0.5 text-sm font-bold text-foreground">
                  {formatRupiah(parseFloat(data.budget.amount))}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Terpakai</p>
                <p className={cn('mt-0.5 text-sm font-bold', isExceeded ? 'text-danger' : 'text-foreground')}>
                  {formatRupiah(data.used)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Sisa</p>
                <p className={cn(
                  'mt-0.5 text-sm font-bold',
                  (data.remaining ?? 0) < 0 ? 'text-danger' : 'text-foreground'
                )}>
                  {formatRupiah(data.remaining ?? 0)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className={cn(
                'font-semibold',
                isExceeded ? 'text-danger' : isWarning ? 'text-yellow-600 dark:text-yellow-400' : 'text-foreground'
              )}>
                {pct}%
              </span>
              <span>100%</span>
            </div>
            <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full transition-all duration-500', barColor)}
                style={{ width: `${Math.min(pct, 100)}%` }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            {/* Tombol aksi */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PencilLine className="h-3.5 w-3.5" />
                Ubah Budget
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Hapus budget"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </>

        ) : (
          /* Belum ada budget */
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Belum ada budget untuk{' '}
              <span className="font-medium text-foreground">
                {MONTH_NAMES[month - 1]} {year}
              </span>
              .
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Tetapkan Budget
            </button>
          </div>
        )}
      </div>

      {/* Modal form */}
      {showForm && (
        <BudgetForm
          defaultMonth={month}
          defaultYear={year}
          defaultAmount={data?.budget ? parseFloat(data.budget.amount) : undefined}
          budgetId={data?.budget?.id}
          onSuccess={() => {
            setShowForm(false)
            fetchBudget()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  )
}
