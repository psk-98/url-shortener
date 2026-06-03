import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  const body = await request.json()

  const res = await fetch(`${process.env.API_URL}/utms/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const error = await res.json()
    console.log(error)
    return NextResponse.json(
      { message: res, error: error },
      { status: res.status },
    )
  }

  console.log(data)
  return NextResponse.json({
    data: data,
    success: true,
  })
}
