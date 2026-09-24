import { cookies } from 'next/headers'

const SESSION_COOKIE = 'duitku_session'

// Format: `userId:name` — sederhana, cukup untuk kebutuhan ini
function encode(userId: number, name: string) {
  return Buffer.from(`${userId}:${name}`).toString('base64')
}

function decode(token: string): { userId: number; name: string } | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8')
    const sep = raw.indexOf(':')
    if (sep === -1) return null
    const userId = parseInt(raw.slice(0, sep), 10)
    const name = raw.slice(sep + 1)
    if (isNaN(userId) || !name) return null
    return { userId, name }
  } catch {
    return null
  }
}

export async function createSession(userId: number, name: string) {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, encode(userId, name), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // 7 hari — cukup untuk sesi mahasiswa tanpa harus login terus
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function getSession(): Promise<{ userId: number; name: string } | null> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  return decode(token)
}

export async function destroySession() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}
