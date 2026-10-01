// Kolom yang dikembalikan oleh semua endpoint transaksi.
// Tanggal diformat di database supaya tidak bergeser karena zona waktu.
export const TRANSACTION_COLUMNS = `id, type, amount::float8 AS amount, category, description,
  to_char(transaction_date, 'YYYY-MM-DD') AS date`

export type TransactionRow = {
  id: number
  type: 'income' | 'expense'
  amount: number
  category: string | null
  description: string | null
  date: string
}

/** Mengembalikan body JSON berbentuk objek, atau null jika body bukan JSON yang valid. */
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json()
    return body && typeof body === 'object' && !Array.isArray(body) ? body : null
  } catch {
    return null
  }
}

export const INVALID_BODY = { error: 'Body permintaan harus berupa objek JSON.' }

export function parseId(id: string) {
  const value = Number(id)
  return Number.isInteger(value) && value > 0 ? value : null
}
