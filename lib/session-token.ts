// Token session yang ditandatangani HMAC-SHA256.
// Format: base64url(payload JSON) + "." + base64url(signature)
// Memakai Web Crypto supaya bisa dipakai di middleware maupun route handler.

export const SESSION_COOKIE = 'duitku_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 hari

export type SessionData = { userId: number; name: string }

type Payload = { uid: number; name: string; exp: number }

const encoder = new TextEncoder()

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET belum diatur di environment.')
  }
  // Hanya untuk development lokal — production wajib memakai SESSION_SECRET
  return 'duitku-dev-secret-jangan-dipakai-di-production'
}

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

function getKey() {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signSession({ userId, name }: SessionData) {
  const payload: Payload = {
    uid: userId,
    name,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  }
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign('HMAC', await getKey(), encoder.encode(body))
  return `${body}.${toBase64Url(new Uint8Array(signature))}`
}

export async function verifySession(token: string | undefined): Promise<SessionData | null> {
  if (!token) return null
  const [body, signature, ...rest] = token.split('.')
  if (!body || !signature || rest.length > 0) return null

  try {
    // crypto.subtle.verify membandingkan signature secara constant-time
    const valid = await crypto.subtle.verify(
      'HMAC',
      await getKey(),
      fromBase64Url(signature),
      encoder.encode(body)
    )
    if (!valid) return null

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Payload
    if (!Number.isInteger(payload.uid) || typeof payload.name !== 'string') return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null

    return { userId: payload.uid, name: payload.name }
  } catch {
    return null
  }
}
