import type { NextRequest } from "next/server"
import { auth0 } from "./lib/auth0"
import { myvoltAuth0 } from "./lib/myvolt-auth0"

export async function middleware(request: NextRequest) {
  // Route /myvolt requests to staff Auth0 client
  if (request.nextUrl.pathname.startsWith("/myvolt")) {
    return await myvoltAuth0.middleware(request)
  }
  // Route public VoltRadio requests to public Auth0 client
  return await auth0.middleware(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
}
