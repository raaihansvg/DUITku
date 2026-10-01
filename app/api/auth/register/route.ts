import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import type { PoolClient } from 'pg'
import pool from '@/lib/db'
import { createSession } from '@/lib/session'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const { name, email, password } = await req.json().catch(() => ({}))

  if (
    typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' ||
    !name.trim() || !email.trim() || !password
  ) {
    return NextResponse.json({ error: 'Semua kolom wajib diisi.' }, { status: 400 })
  }
  if (name.trim().length > 100) {
    return NextResponse.json({ error: 'Nama maksimal 100 karakter.' }, { status: 400 })
  }
  if (!EMAIL_PATTERN.test(email.trim()) || email.trim().length > 150) {
    return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password minimal 8 karakter.' }, { status: 400 })
  }

  let client: PoolClient | undefined
  try {
    client = await pool.connect()
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
    // Dua pendaftaran bersamaan dengan email sama — ditolak oleh constraint UNIQUE
    if ((err as { code?: string }).code === '23505') {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 })
    }
    console.error('Register gagal:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan saat mendaftar.' }, { status: 500 })
  } finally {
    client?.release()
  }
}
