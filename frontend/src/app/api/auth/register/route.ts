import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  console.log(body)

  const res = await fetch(`${process.env.API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    console.log(data)
    return NextResponse.json({ message: data.detail }, { status: res.status })
  }

  const response = NextResponse.json({
    user: data,
    success: true,
  })

  return response
}
