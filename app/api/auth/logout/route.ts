import { type NextRequest, NextResponse } from "next/server"
import { publicAuthConfig, createAuth0Urls } from "@/lib/auth0-config"
import { deleteSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  // Delete session
  await deleteSession()

  // Build Auth0 logout URL
  const auth0Urls = createAuth0Urls(publicAuthConfig.domain)
  const params = new URLSearchParams({
    client_id: publicAuthConfig.clientId,
    returnTo: publicAuthConfig.baseUrl,
  })

  const logoutUrl = `${auth0Urls.logout}?${params.toString()}`

  return NextResponse.redirect(logoutUrl)
}
