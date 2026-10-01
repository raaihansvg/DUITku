import { NextResponse } from 'next/server'
import { z } from 'zod'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'
import { transactionSchema } from '@/app/lib/validations/transactions'
import { INVALID_BODY, TRANSACTION_COLUMNS, readJson, type TransactionRow } from './shared'

const dateParam = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')

const filterSchema = z
  .object({
    type: z.enum(['income', 'expense'], { message: 'Tipe harus income atau expense' }).optional(),
    category: z.string().trim().min(1).max(50).optional(),
    from: dateParam.optional(),
    to: dateParam.optional(),
  })
  .refine((f) => !f.from || !f.to || f.from <= f.to, {
    message: 'Tanggal awal tidak boleh setelah tanggal akhir',
    path: ['from'],
  })

/**
 * GET /api/transactions?type=&category=&from=YYYY-MM-DD&to=YYYY-MM-DD
 * Daftar transaksi milik user, terbaru dulu. Semua filter opsional.
 */
export async function GET(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const raw = Object.fromEntries(
    ['type', 'category', 'from', 'to']
      .map((key) => [key, searchParams.get(key) || undefined])
  )
  const parsed = filterSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Filter tidak valid.' },
      { status: 400 }
    )
  }
  const { type, category, from, to } = parsed.data

  // Kondisi WHERE disusun dinamis, nilainya tetap lewat parameter ($n)
  const values: (string | number)[] = [session.userId]
  const conditions = ['user_id = $1']
  if (type) {
    values.push(type)
    conditions.push(`type = $${values.length}`)
  }
  if (category) {
    values.push(category)
    conditions.push(`category = $${values.length}`)
  }
  if (from) {
    values.push(from)
    conditions.push(`transaction_date >= $${values.length}`)
  }
  if (to) {
    values.push(to)
    conditions.push(`transaction_date <= $${values.length}`)
  }

  try {
    const result = await pool.query<TransactionRow>(
      `SELECT ${TRANSACTION_COLUMNS}
       FROM transactions
       WHERE ${conditions.join(' AND ')}
       ORDER BY transaction_date DESC, created_at DESC, id DESC`,
      values
    )
    return NextResponse.json({ transactions: result.rows })
  } catch (err) {
    console.error('GET /api/transactions gagal:', err)
    return NextResponse.json({ error: 'Gagal memuat transaksi.' }, { status: 500 })
  }
}

/**
 * POST /api/transactions
 * Menambah transaksi baru untuk user yang sedang login.
 */
export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await readJson(req)
  if (!body) {
    return NextResponse.json(INVALID_BODY, { status: 400 })
  }
  const parsed = transactionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' },
      { status: 400 }
    )
  }
  const { type, amount, category, description, date } = parsed.data

  try {
    const result = await pool.query<TransactionRow>(
      `INSERT INTO transactions (user_id, type, amount, category, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${TRANSACTION_COLUMNS}`,
      [session.userId, type.toLowerCase(), amount, category, description?.trim() || null, date]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err) {
    console.error('POST /api/transactions gagal:', err)
    return NextResponse.json({ error: 'Gagal menyimpan transaksi.' }, { status: 500 })
  }
}
