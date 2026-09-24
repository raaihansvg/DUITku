import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'
import { createSession } from '@/lib/session'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 })
  }

  const client = await pool.connect()
  try {
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
  } finally {
    client.release()
  }
}
