"use client"

import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const res = await fetch("/api/auth/logout", { method: "POST" })
    if (res.ok) {
      router.push("/dashboard")
      router.refresh()
    }
  }
  return <Button onClick={handleLogout}>Logout</Button>
}
