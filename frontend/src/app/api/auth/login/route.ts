import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { da } from "zod/locales"

export async function POST(request: NextRequest) {
  const body = await request.json()

  const res = await fetch(
    `${process.env.API_URL}/api/v1/auth/login/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: res.status },
    )
  }
  const data = await res.json()
  const token = data.access_token

  const response = NextResponse.json({
    user: data.user,
    success: true,
  })

  response.cookies.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  })

  return response
}
