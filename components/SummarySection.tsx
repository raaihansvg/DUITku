'use client'

import { useCallback, useEffect, useState } from 'react'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { SummaryCard } from '@/components/SummaryCard'
import { TRANSACTION_CHANGED } from '@/lib/transaction-events'

type Summary = {
  totalIncome: number
  totalExpense: number
  balance: number
}

async function loadSummary(): Promise<Summary> {
  const res = await fetch('/api/transactions/summary')
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error ?? 'Gagal memuat ringkasan.')
  return json
}

/**
 * Ringkasan keuangan (SRS-006), dimuat via AJAX dari /api/transactions/summary
 * dan dimuat ulang setiap kali transaksi berubah.
 */
export function SummarySection() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(() => {
    loadSummary()
      .then((data) => {
        setSummary(data)
        setError(null)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Terjadi kesalahan.'))
  }, [])

  useEffect(() => {
    fetchSummary()
    window.addEventListener(TRANSACTION_CHANGED, fetchSummary)
    return () => window.removeEventListener(TRANSACTION_CHANGED, fetchSummary)
  }, [fetchSummary])

  if (error && !summary) {
    return (
      <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
        {error}{' '}
        <button type="button" onClick={fetchSummary} className="font-semibold underline">
          Coba lagi
        </button>
      </p>
    )
  }

  if (!summary) {
    return (
      <div className="grid gap-4 md:grid-cols-3" aria-busy="true" aria-label="Memuat ringkasan">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-2xl border border-border bg-card" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard title="Total Saldo" amount={summary.balance} icon={Wallet} />
      <SummaryCard title="Total Pemasukan" amount={summary.totalIncome} icon={TrendingUp} type="income" />
      <SummaryCard title="Total Pengeluaran" amount={summary.totalExpense} icon={TrendingDown} type="expense" />
    </div>
  )
}
