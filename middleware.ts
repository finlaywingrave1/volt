import { auth0 } from "./lib/auth0"; // Import the Auth0 client

export async function middleware(request: NextRequest) {
  return auth0.middleware(request); // Use the Node.js middleware
}

export const config = {
  matcher: [
    // Protect all routes except Next.js assets and public files
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
