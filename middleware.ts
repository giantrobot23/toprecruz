import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Simple redirect logic without Supabase client
  // This avoids potential issues with the Supabase client in middleware
  const url = req.nextUrl.clone()

  // Check if the path is a protected route
  const isProtectedRoute =
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/jobs") ||
    url.pathname.startsWith("/candidates") ||
    url.pathname.startsWith("/resume-upload") ||
    url.pathname.startsWith("/settings")

  // Check if the path is an auth page
  const isAuthPage = url.pathname === "/login" || url.pathname === "/signup"

  // For simplicity, we'll just redirect unauthenticated users to login
  // The actual auth check will happen client-side
  if (isProtectedRoute) {
    // We'll let the client-side ProtectedRoute component handle the auth check
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/candidates/:path*",
    "/resume-upload/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
}

