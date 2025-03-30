import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define protected routes
  const protectedRoutes = ["/dashboard", "/jobs", "/candidates", "/resume-upload"]
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Define auth routes (login/signup)
  const authRoutes = ["/login", "/signup"]
  const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Redirect logic
  if (isProtectedRoute && !session) {
    // Redirect to login if trying to access protected route without session
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isAuthRoute && session) {
    // Redirect to dashboard if trying to access auth routes with active session
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

