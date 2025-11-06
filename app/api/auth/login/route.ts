import { type NextRequest, NextResponse } from "next/server"
import { publicAuthConfig, createAuth0Urls } from "@/lib/auth0-config"
import { generateCodeVerifier, generateCodeChallenge, generateState } from "@/lib/pkce"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  // Generate PKCE parameters
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const state = generateState()

  // Store code verifier and state in cookies for callback
  const cookieStore = await cookies()
  cookieStore.set("auth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  })
  cookieStore.set("auth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })

  // Build authorization URL
  const auth0Urls = createAuth0Urls(publicAuthConfig.domain)
  const params = new URLSearchParams({
    response_type: "code",
    client_id: publicAuthConfig.clientId,
    redirect_uri: `${publicAuthConfig.baseUrl}/api/auth/callback`,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: publicAuthConfig.scope,
    state: state,
    audience: publicAuthConfig.audience,
  })

  const authUrl = `${auth0Urls.authorize}?${params.toString()}`

  return NextResponse.redirect(authUrl)
}
