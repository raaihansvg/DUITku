import { cookies } from 'next/headers'
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type SessionData } from './session-token'

export async function createSession(userId: number, name: string) {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, await signSession({ userId, name }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // 7 hari — cukup untuk sesi mahasiswa tanpa harus login terus
    maxAge: SESSION_MAX_AGE,
  })
}

export async function getSession(): Promise<SessionData | null> {
  const jar = await cookies()
  return verifySession(jar.get(SESSION_COOKIE)?.value)
}

export async function destroySession() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}
