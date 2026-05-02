import Link from "next/link"
import { Button } from "../ui/button"
import { cookies } from "next/headers"
import LogoutButton from "../auth/logout-button"

export default async function Nav() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  const isLoggedIn = Boolean(token)
  return (
    <nav className="w-full px-16 py-8 flex justify-between">
      <div>
        <Link href="/">Logo here</Link>
      </div>
      <div className="flex justify-between">
        {isLoggedIn ? (
          <>
            <Link href="/login" className="mr-4">
              <Button variant="secondary">Profile</Button>
            </Link>

            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="mr-4">
              <Button variant="secondary">Login</Button>
            </Link>

            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
