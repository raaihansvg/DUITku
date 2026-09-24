import { redirect } from 'next/navigation'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { getSession } from '@/lib/session'
import { SummaryCard } from '@/components/SummaryCard'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  // INI PERHITUNGAN DUMMY, JANGAN LUPA DIHAPUS NANTI
  const balance = 1500000
  const totalIncome = 3000000
  const totalExpense = 1500000

  return (
    <DashboardClient userName={session.name}>
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
    </DashboardClient>
  )
}
