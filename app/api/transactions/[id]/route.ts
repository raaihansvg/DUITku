import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'
import { transactionSchema } from '@/app/lib/validations/transactions'
import { INVALID_BODY, TRANSACTION_COLUMNS, parseId, readJson, type TransactionRow } from '../shared'

/**
 * PATCH /api/transactions/[id]
 * Mengubah transaksi. Hanya pemilik (user_id cocok) yang bisa mengubah.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const transactionId = parseId((await params).id)
  if (!transactionId) {
    return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
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
      `UPDATE transactions
       SET type = $1, amount = $2, category = $3, description = $4, transaction_date = $5
       WHERE id = $6 AND user_id = $7
       RETURNING ${TRANSACTION_COLUMNS}`,
      [type.toLowerCase(), amount, category, description?.trim() || null, date, transactionId, session.userId]
    )

    if (result.rowCount === 0) {
      // Tidak ditemukan atau bukan milik user ini (isolasi data)
      return NextResponse.json({ error: 'Transaksi tidak ditemukan.' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (err) {
    console.error('PATCH /api/transactions/[id] gagal:', err)
    return NextResponse.json({ error: 'Gagal mengubah transaksi.' }, { status: 500 })
  }
}

/**
 * DELETE /api/transactions/[id]
 * Menghapus transaksi. Hanya pemilik (user_id cocok) yang bisa menghapus.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const transactionId = parseId((await params).id)
  if (!transactionId) {
    return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  }

  try {
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [transactionId, session.userId]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/transactions/[id] gagal:', err)
    return NextResponse.json({ error: 'Gagal menghapus transaksi.' }, { status: 500 })
  }
}
