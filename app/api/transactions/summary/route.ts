import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

/**
 * GET /api/transactions/summary
 * Total pemasukan, total pengeluaran, dan saldo milik user yang sedang login.
 */
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await pool.query<{ total_income: number; total_expense: number }>(
      `SELECT
         COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0)::float8  AS total_income,
         COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0)::float8 AS total_expense
       FROM transactions
       WHERE user_id = $1`,
      [session.userId]
    )
    const { total_income, total_expense } = result.rows[0]

    return NextResponse.json({
      totalIncome: total_income,
      totalExpense: total_expense,
      balance: total_income - total_expense,
    })
  } catch (err) {
    console.error('GET /api/transactions/summary gagal:', err)
    return NextResponse.json({ error: 'Gagal memuat ringkasan.' }, { status: 500 })
  }
}
