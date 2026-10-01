import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'
import { budgetSchema } from '@/app/lib/validations/budget'

/**
 * GET /api/budget?month=M&year=Y
 * Mengembalikan data budget + total pengeluaran bulan tersebut.
 * Jika month/year tidak diisi, default ke bulan & tahun sekarang.
 */
export async function GET(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const now = new Date()
  const month = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1), 10)
  const year = parseInt(searchParams.get('year') ?? String(now.getFullYear()), 10)

  if (month < 1 || month > 12 || year < 2000) {
    return NextResponse.json({ error: 'Parameter bulan atau tahun tidak valid.' }, { status: 400 })
  }

  const client = await pool.connect()
  try {
    // Ambil budget milik user untuk bulan & tahun yang diminta
    const budgetRes = await client.query<{
      id: number
      month: number
      year: number
      amount: string
    }>(
      'SELECT id, month, year, amount FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3',
      [session.userId, month, year]
    )
    const budget = budgetRes.rows[0] ?? null

    // Hitung total pengeluaran dari tabel transactions untuk bulan tersebut
    const expenseRes = await client.query<{ used: string }>(
      `SELECT COALESCE(SUM(amount), 0) AS used
       FROM transactions
       WHERE user_id = $1
         AND type = 'expense'
         AND EXTRACT(MONTH FROM transaction_date) = $2
         AND EXTRACT(YEAR  FROM transaction_date) = $3`,
      [session.userId, month, year]
    )
    const used = parseFloat(expenseRes.rows[0].used)
    const budgetAmount = budget ? parseFloat(budget.amount) : null

    return NextResponse.json({
      budget,
      used,
      remaining: budgetAmount !== null ? budgetAmount - used : null,
      percentage: budgetAmount ? Math.round((used / budgetAmount) * 100) : null,
    })
  } finally {
    client.release()
  }
}

/**
 * POST /api/budget
 * Membuat budget baru. Satu user hanya boleh punya satu budget per bulan.
 */
export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = budgetSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }
  const { month, year, amount } = parsed.data

  const client = await pool.connect()
  try {
    const result = await client.query(
      `INSERT INTO budgets (user_id, month, year, amount)
       VALUES ($1, $2, $3, $4)
       RETURNING id, month, year, amount`,
      [session.userId, month, year, amount]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err) {
    // Unique constraint violation — budget bulan ini sudah ada
    if (err instanceof Error && err.message.includes('unique')) {
      return NextResponse.json(
        { error: 'Budget untuk bulan ini sudah ada. Silakan ubah yang sudah ada.' },
        { status: 409 }
      )
    }
    throw err
  } finally {
    client.release()
  }
}
