import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import type { PoolClient } from 'pg'
import pool from '@/lib/db'
import { createSession } from '@/lib/session'

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}))

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 })
  }

  let client: PoolClient | undefined
  try {
    client = await pool.connect()
    const result = await client.query(
      'SELECT id, name, password_hash FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    )

    const user = result.rows[0]
    if (!user) {
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 })
    }

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 })
    }

    await createSession(user.id, user.name)
    return NextResponse.json({ ok: true, name: user.name })
  } catch (err) {
    console.error('Login gagal:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan saat masuk.' }, { status: 500 })
  } finally {
    client?.release()
  }
}
