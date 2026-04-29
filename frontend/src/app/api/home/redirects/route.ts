import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()

  const res = await fetch(`${process.env.API_URL}/redirects/guest_redirect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    return NextResponse.json({ message: res }, { status: res.status })
  }

  const data = await res.json()

  return NextResponse.json({
    data: data,
    success: true,
  })
}
