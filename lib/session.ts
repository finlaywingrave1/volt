// Secure session management with HTTP-only cookies
import { cookies } from "next/headers"
import { auth0Config } from "./auth0-config"
import crypto from "crypto"

const SESSION_COOKIE_NAME = "volt_session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

interface SessionData {
  userId: string
  email: string
  name: string
  accessToken: string
  refreshToken?: string
  expiresAt: number
}

export async function createSession(data: SessionData) {
  const cookieStore = await cookies()
  const encrypted = encrypt(JSON.stringify(data))

  cookieStore.set(SESSION_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const encrypted = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!encrypted) return null

  try {
    const decrypted = decrypt(encrypted)
    const session: SessionData = JSON.parse(decrypted)

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      await deleteSession()
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const key = crypto.createHash("sha256").update(auth0Config.secret).digest()
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  return iv.toString("hex") + ":" + encrypted
}

function decrypt(text: string): string {
  const parts = text.split(":")
  const iv = Buffer.from(parts[0], "hex")
  const encrypted = parts[1]
  const key = crypto.createHash("sha256").update(auth0Config.secret).digest()
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}
