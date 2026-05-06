import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  const body = await request.json()
  const res = await fetch(`${process.env.API_URL}/redirects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
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

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const body = await request.json()

  const res = await fetch(`${process.env.API_URL}/redirects/${body.alias}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
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

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const body = await request.json()

  const res = await fetch(`${process.env.API_URL}/redirects/${body.alias}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    return NextResponse.json({ message: res }, { status: res.status })
  }

  return NextResponse.json({
    success: true,
  })
}
