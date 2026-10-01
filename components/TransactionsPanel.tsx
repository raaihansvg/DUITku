'use client'

import { useEffect, useState } from 'react'
import { Plus, PencilLine, Trash2, RefreshCw, ArrowDownLeft, ArrowUpRight, FilterX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/app/lib/constants'
import { notifyTransactionChanged } from '@/lib/transaction-events'
import { TransactionFormModal } from '@/components/TransactionFormModal'
import type { TransactionFormValues } from '@/app/lib/validations/transactions'

type Transaction = {
  id: number
  type: 'income' | 'expense'
  amount: number
  category: string | null
  description: string | null
  date: string
}

type Filters = {
  type: '' | 'income' | 'expense'
  category: string
  from: string
  to: string
}

type ModalState = { mode: 'create' } | { mode: 'edit'; transaction: Transaction } | null

const EMPTY_FILTERS: Filters = { type: '', category: '', from: '', to: '' }

const ALL_CATEGORIES = Array.from(new Set([...CATEGORIES.INCOME, ...CATEGORIES.EXPENSE]))

const inputClass =
  'w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(y, m - 1, d)
  )
}

function toFormValues(t: Transaction): TransactionFormValues {
  return {
    type: t.type === 'income' ? 'INCOME' : 'EXPENSE',
    amount: t.amount,
    category: t.category ?? '',
    description: t.description ?? '',
    date: t.date,
  }
}

async function loadTransactions(filters: Filters, signal: AbortSignal): Promise<Transaction[]> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value)
  }
  const res = await fetch(`/api/transactions?${params}`, { signal })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error ?? 'Gagal memuat transaksi.')
  return json.transactions
}

/**
 * Riwayat transaksi + filter + tambah/ubah/hapus (SRS-004, SRS-005, SRS-008).
 * Semua data dimuat dan dikirim via AJAX ke /api/transactions tanpa reload halaman.
 */
export function TransactionsPanel() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  // Muat ulang setiap kali filter berubah atau reload() dipanggil; request lama dibatalkan.
  // State loading dinyalakan oleh event handler, bukan di effect.
  useEffect(() => {
    const controller = new AbortController()
    loadTransactions(filters, controller.signal)
      .then((rows) => {
        setTransactions(rows)
        setError(null)
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [filters, reloadKey])

  function reload() {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }

  function resetFilters() {
    setLoading(true)
    setFilters(EMPTY_FILTERS)
  }

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setLoading(true)
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      // Kategori di-reset jika tidak cocok dengan tipe yang baru dipilih
      if (key === 'type' && value) {
        const allowed: readonly string[] = CATEGORIES[value === 'income' ? 'INCOME' : 'EXPENSE']
        if (!allowed.includes(next.category)) next.category = ''
      }
      return next
    })
  }

  async function handleDelete(t: Transaction) {
    if (!confirm(`Hapus transaksi ${t.category ?? ''} sebesar ${formatRupiah(t.amount)}?`)) return

    setDeletingId(t.id)
    setError(null)
    try {
      const res = await fetch(`/api/transactions/${t.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Gagal menghapus transaksi.')
      }
      notifyTransactionChanged()
      reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setDeletingId(null)
    }
  }

  function handleSaved() {
    setModal(null)
    notifyTransactionChanged()
    reload()
  }

  const categoryOptions =
    filters.type === 'income' ? CATEGORIES.INCOME : filters.type === 'expense' ? CATEGORIES.EXPENSE : ALL_CATEGORIES
  const hasFilter = Object.values(filters).some(Boolean)

  return (
    <>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm" aria-labelledby="riwayat-title">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 id="riwayat-title" className="font-semibold text-foreground">
            Riwayat Transaksi
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reload}
              disabled={loading}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Muat ulang transaksi"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
            <button
              type="button"
              onClick={() => setModal({ mode: 'create' })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="h-4 w-4" />
              Tambah Transaksi
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className="text-xs font-medium text-muted-foreground">
            Tipe
            <select
              className={cn(inputClass, 'mt-1')}
              value={filters.type}
              onChange={(e) => updateFilter('type', e.target.value as Filters['type'])}
            >
              <option value="">Semua</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Kategori
            <select
              className={cn(inputClass, 'mt-1')}
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
            >
              <option value="">Semua</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Dari tanggal
            <input
              type="date"
              className={cn(inputClass, 'mt-1')}
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => updateFilter('from', e.target.value)}
            />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Sampai tanggal
            <input
              type="date"
              className={cn(inputClass, 'mt-1')}
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => updateFilter('to', e.target.value)}
            />
          </label>
        </div>
        {hasFilter && (
          <button
            type="button"
            onClick={resetFilters}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <FilterX className="h-4 w-4" />
            Hapus filter
          </button>
        )}

        {/* Error */}
        {error && (
          <p role="alert" className="mb-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {/* Isi */}
        {transactions === null ? (
          loading && (
            <div className="flex h-28 items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Memuat" />
            </div>
          )
        ) : transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {hasFilter ? 'Tidak ada transaksi yang cocok dengan filter.' : 'Belum ada transaksi. Yuk catat yang pertama!'}
          </p>
        ) : (
          <ul className={cn('divide-y divide-border transition-opacity', loading && 'opacity-60')}>
            {transactions.map((t) => {
              const isIncome = t.type === 'income'
              return (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-full',
                      isIncome ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                    )}
                    aria-hidden
                  >
                    {isIncome ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {t.category ?? '-'}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(t.date)}
                      {t.description && ` · ${t.description}`}
                    </p>
                  </div>

                  <p className={cn('shrink-0 text-sm font-bold', isIncome ? 'text-emerald-600' : 'text-rose-600')}>
                    {isIncome ? '+' : '-'}
                    {formatRupiah(t.amount)}
                  </p>

                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => setModal({ mode: 'edit', transaction: t })}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Ubah transaksi"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t)}
                      disabled={deletingId === t.id}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Hapus transaksi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {modal && (
        <TransactionFormModal
          transactionId={modal.mode === 'edit' ? modal.transaction.id : undefined}
          initialData={modal.mode === 'edit' ? toFormValues(modal.transaction) : undefined}
          onSuccess={handleSaved}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  )
}
