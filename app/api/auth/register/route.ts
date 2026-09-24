import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { createSession } from '@/lib/session'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: 'Semua kolom wajib diisi.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password minimal 8 karakter.' }, { status: 400 })
  }

  const client = await pool.connect()
  try {
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    )
    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 })
    }

    // 12 rounds — cukup aman tanpa membuat register terasa lambat
    const hashed = await bcrypt.hash(password, 12)

    const result = await client.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name',
      [name.trim(), email.trim().toLowerCase(), hashed]
    )
    const user = result.rows[0]

    await createSession(user.id, user.name)
    return NextResponse.json({ ok: true, name: user.name })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mendaftar.'
    return NextResponse.json({ error: msg }, { status: 500 })
  } finally {
    client.release()
  }
}
