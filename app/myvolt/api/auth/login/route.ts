import { type NextRequest, NextResponse } from "next/server"
import { staffAuthConfig, createAuth0Urls } from "@/lib/auth0-config"
import { generateCodeVerifier, generateCodeChallenge, generateState } from "@/lib/pkce"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  // Generate PKCE parameters
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const state = generateState()

  // Store code verifier and state in cookies for callback (staff namespace)
  const cookieStore = await cookies()
  cookieStore.set("staff_auth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/myvolt",
  })
  cookieStore.set("staff_auth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/myvolt",
  })

  // Build authorization URL
  const auth0Urls = createAuth0Urls(staffAuthConfig.domain)
  const params = new URLSearchParams({
    response_type: "code",
    client_id: staffAuthConfig.clientId,
    redirect_uri: `${staffAuthConfig.baseUrl}/api/auth/callback`,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: staffAuthConfig.scope,
    state: state,
    audience: staffAuthConfig.audience,
  })

  const authUrl = `${auth0Urls.authorize}?${params.toString()}`

  return NextResponse.redirect(authUrl)
}
