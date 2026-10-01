import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'
import { parseTheme, THEME_COOKIE } from '@/lib/theme'
import { SummarySection } from '@/components/SummarySection'
import { BudgetCard } from '@/components/BudgetCard'
import { TransactionsPanel } from '@/components/TransactionsPanel'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const jar = await cookies()
  const initialTheme = parseTheme(jar.get(THEME_COOKIE)?.value)

  return (
    <DashboardClient userName={session.name} initialTheme={initialTheme}>
      {/* Ringkasan Keuangan (SRS-006) — data dimuat via AJAX */}
      <SummarySection />

      {/* Budget Bulanan (SRS-009) — data dimuat via AJAX */}
      <BudgetCard />

      {/* Riwayat, filter, dan CRUD transaksi (SRS-004, 005, 008) */}
      <TransactionsPanel />
    </DashboardClient>
  )
}
