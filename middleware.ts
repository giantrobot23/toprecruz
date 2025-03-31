import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Refresh session if expired
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Middleware auth error:", error)
      return res
    }

    // Define protected routes
    const protectedRoutes = ["/dashboard", "/jobs", "/candidates", "/resume-upload"]
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    // Define auth routes (login/signup)
    const authRoutes = ["/login", "/signup"]
    const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    // Redirect logic
    if (isProtectedRoute && !session) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (isAuthRoute && session) {
      // If there's a redirect URL in the query params, use that
      const redirectTo = req.nextUrl.searchParams.get("redirect") || "/dashboard"
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
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

