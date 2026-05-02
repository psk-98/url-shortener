import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value
  const { pathname } = request.nextUrl

  const isLoggedIn = Boolean(token)

  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isLoginRoute = pathname === "/login"
  const isRegisterRoute = pathname === "/register"

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if ((isLoginRoute || isRegisterRoute) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*"],
}
