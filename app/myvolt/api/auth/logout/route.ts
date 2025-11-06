import { type NextRequest, NextResponse } from "next/server"
import { staffAuthConfig, createAuth0Urls } from "@/lib/auth0-config"
import { deleteStaffSession } from "@/lib/staff-session"

export async function GET(request: NextRequest) {
  // Delete staff session
  await deleteStaffSession()

  // Build Auth0 logout URL
  const auth0Urls = createAuth0Urls(staffAuthConfig.domain)
  const params = new URLSearchParams({
    client_id: staffAuthConfig.clientId,
    returnTo: staffAuthConfig.baseUrl,
  })

  const logoutUrl = `${auth0Urls.logout}?${params.toString()}`

  return NextResponse.redirect(logoutUrl)
}
