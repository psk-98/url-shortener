import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  const res = await fetch(`${process.env.API_URL}/users`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ message: data.detail }, { status: res.status })
  }

  return NextResponse.json({
    data: data,
    success: true,
  })
}

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  const body = await request.json()

  const res = await fetch(`${process.env.API_URL}/users`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.json()
    return NextResponse.json({ message: error.detail }, { status: res.status })
  }

  return NextResponse.json({
    success: true,
  })
}

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const body = await request.json()

  const res = await fetch(`${process.env.API_URL}/users/change_password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password: body.current_password, ...body }),
  })

  if (!res.ok) {
    const error = await res.json()
    return NextResponse.json({ message: error.detail }, { status: res.status })
  }

  return NextResponse.json({
    success: true,
  })
}

export async function DELETE() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  const res = await fetch(`${process.env.API_URL}/users`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
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
