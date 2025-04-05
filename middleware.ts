import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next()
  
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res })
    
    // Refresh session if expired
    await supabase.auth.getSession()
    
    // Get the session again after refresh
    const { data: { session } } = await supabase.auth.getSession()

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/signin', '/auth/callback']
    const isPublicRoute = publicRoutes.some(route => 
      req.nextUrl.pathname === route || 
      req.nextUrl.pathname.startsWith('/api/') ||
      req.nextUrl.pathname.includes('.')
    )

    console.log(`Path: ${req.nextUrl.pathname}, Session: ${!!session}, Public: ${isPublicRoute}`)

    // Check if user is authenticated and trying to access a protected route
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/signin', req.url)
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is signed in and the current path is /login or /signin, redirect to /dashboard
    if (session && ['/login', '/signin'].includes(req.nextUrl.pathname)) {
      console.log("User is signed in and trying to access login/signin page, redirecting to dashboard")
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // For all other cases, continue with the request
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, continue with the request
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
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 