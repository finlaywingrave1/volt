export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import { publicAuthConfig, createAuth0Urls } from "@/lib/auth0-config"
import { cookies } from "next/headers"
import { createSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code || !state) {
    return NextResponse.redirect(`${publicAuthConfig.baseUrl}/login?error=missing_parameters`)
  }

  // Verify state
  const cookieStore = await cookies()
  const storedState = cookieStore.get("auth_state")?.value
  const codeVerifier = cookieStore.get("auth_code_verifier")?.value

  if (!storedState || !codeVerifier || storedState !== state) {
    return NextResponse.redirect(`${publicAuthConfig.baseUrl}/login?error=invalid_state`)
  }

  try {
    // Exchange code for tokens
    const auth0Urls = createAuth0Urls(publicAuthConfig.domain)
    const tokenResponse = await fetch(auth0Urls.token, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: publicAuthConfig.clientId,
        client_secret: publicAuthConfig.clientSecret,
        code: code,
        code_verifier: codeVerifier,
        redirect_uri: `${publicAuthConfig.baseUrl}/api/auth/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Token exchange failed")
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch(auth0Urls.userInfo, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to get user info")
    }

    const user = await userResponse.json()

    // Create session
    await createSession({
      userId: user.sub,
      email: user.email,
      name: user.name,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    })

    // Clean up temporary cookies
    cookieStore.delete("auth_code_verifier")
    cookieStore.delete("auth_state")

    // Redirect to home or intended page
    return NextResponse.redirect(`${publicAuthConfig.baseUrl}/`)
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(`${publicAuthConfig.baseUrl}/login?error=authentication_failed`)
  }
}
