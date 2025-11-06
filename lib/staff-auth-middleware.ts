// Middleware to protect staff routes
import { getStaffSession } from "./staff-session"

export async function requireStaffAuth() {
  const session = await getStaffSession()

  if (!session) {
    throw new Error("REDIRECT_TO_LOGIN")
  }

  return session
}
