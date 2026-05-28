import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()

  const res = await fetch(`${process.env.API_URL}/redire`, {})
}
