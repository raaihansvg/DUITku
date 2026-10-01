import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'
import { budgetSchema } from '@/app/lib/validations/budget'

/**
 * PATCH /api/budget/[id]
 * Mengubah budget. Hanya pemilik (user_id cocok) yang bisa mengubah.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const budgetId = parseInt(id, 10)
  if (isNaN(budgetId)) {
    return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
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
      `UPDATE budgets
       SET month = $1, year = $2, amount = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, month, year, amount`,
      [month, year, amount, budgetId, session.userId]
    )

    if (result.rowCount === 0) {
      // Tidak ditemukan atau bukan milik user ini (isolasi data)
      return NextResponse.json({ error: 'Budget tidak ditemukan.' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } finally {
    client.release()
  }
}

/**
 * DELETE /api/budget/[id]
 * Menghapus budget. Hanya pemilik (user_id cocok) yang bisa menghapus.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const budgetId = parseInt(id, 10)
  if (isNaN(budgetId)) {
    return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  }

  const client = await pool.connect()
  try {
    const result = await client.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2',
      [budgetId, session.userId]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Budget tidak ditemukan.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } finally {
    client.release()
  }
}
