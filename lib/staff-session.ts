// Secure staff session management with HTTP-only cookies
import { cookies } from "next/headers"
import { staffAuthConfig } from "./auth0-config"
import crypto from "crypto"

const STAFF_SESSION_COOKIE_NAME = "volt_staff_session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

interface StaffSessionData {
  userId: string
  email: string
  name: string
  accessToken: string
  refreshToken?: string
  expiresAt: number
}

export async function createStaffSession(data: StaffSessionData) {
  const cookieStore = await cookies()
  const encrypted = encryptStaff(JSON.stringify(data))

  cookieStore.set(STAFF_SESSION_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/myvolt",
  })
}

export async function getStaffSession(): Promise<StaffSessionData | null> {
  const cookieStore = await cookies()
  const encrypted = cookieStore.get(STAFF_SESSION_COOKIE_NAME)?.value

  if (!encrypted) return null

  try {
    const decrypted = decryptStaff(encrypted)
    const session: StaffSessionData = JSON.parse(decrypted)

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      await deleteStaffSession()
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function deleteStaffSession() {
  const cookieStore = await cookies()
  cookieStore.delete(STAFF_SESSION_COOKIE_NAME)
}

function encryptStaff(text: string): string {
  const iv = crypto.randomBytes(16)
  const key = crypto.createHash("sha256").update(staffAuthConfig.secret).digest()
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  return iv.toString("hex") + ":" + encrypted
}

function decryptStaff(text: string): string {
  const parts = text.split(":")
  const iv = Buffer.from(parts[0], "hex")
  const encrypted = parts[1]
  const key = crypto.createHash("sha256").update(staffAuthConfig.secret).digest()
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}
