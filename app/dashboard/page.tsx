import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { getSession } from '@/lib/session'
import { parseTheme, THEME_COOKIE } from '@/lib/theme'
import { SummaryCard } from '@/components/SummaryCard'
import { BudgetCard } from '@/components/BudgetCard'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const jar = await cookies()
  const initialTheme = parseTheme(jar.get(THEME_COOKIE)?.value)

  // INI PERHITUNGAN DUMMY, JANGAN LUPA DIHAPUS NANTI
  const balance = 1500000
  const totalIncome = 3000000
  const totalExpense = 1500000

  return (
    <DashboardClient userName={session.name} initialTheme={initialTheme}>
      {/* Ringkasan Keuangan (SRS-006) */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Total Saldo" amount={balance} icon={Wallet} />
        <SummaryCard
          title="Total Pemasukan"
          amount={totalIncome}
          icon={TrendingUp}
          type="income"
        />
        <SummaryCard
          title="Total Pengeluaran"
          amount={totalExpense}
          icon={TrendingDown}
          type="expense"
        />
      </div>

      {/* Budget Bulanan (SRS-009) — data dimuat via AJAX */}
      <BudgetCard />
    </DashboardClient>
  )
}
