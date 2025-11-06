import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Check for session cookie
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("volt_session")

  // Protected routes that require authentication
  const protectedRoutes = ["/myvolt", "/request", "/settings", "/apply"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !sessionCookie) {
    // Redirect to login if no session
    const loginUrl = new URL("/api/auth/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/myvolt/:path*", "/request", "/settings", "/apply", "/api/:path*"],
}
