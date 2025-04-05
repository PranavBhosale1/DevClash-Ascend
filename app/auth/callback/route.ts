import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    
    // If code is present, exchange it for a session
    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      // Exchange the auth code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Auth callback error exchanging code:", error)
        return NextResponse.redirect(new URL("/signin?error=auth_callback_error", requestUrl.origin))
      }
      
      console.log("Auth callback: Code exchanged for session successfully")
      
      // After successful authentication, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
    }
    
    console.log("Auth callback: No code present in URL")
    
    // If no code is present, redirect to signin page
    return NextResponse.redirect(new URL("/signin", requestUrl.origin))
  } catch (error) {
    console.error("Auth callback error:", error)
    
    // In case of error, redirect to signin with error parameter
    const errorUrl = new URL("/signin", new URL(request.url).origin)
    errorUrl.searchParams.set("error", "auth_callback_error")
    return NextResponse.redirect(errorUrl)
  }
}

