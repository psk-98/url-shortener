import { cookies } from "next/headers"
import Link from "next/link"
import LogoutButton from "../auth/logout-button"
import { Button } from "../ui/button"

export default async function Nav() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  const isLoggedIn = Boolean(token)
  return (
    <nav className="w-full px-10 md:px-16 lg:px-24 py-8 flex justify-between items-center">
      <div>
        <Link href="/">Logo here</Link>
      </div>
      <div className="flex justify-between">
        {isLoggedIn ? (
          <>
            <Link href="dashboard/profile" className="mr-4">
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
