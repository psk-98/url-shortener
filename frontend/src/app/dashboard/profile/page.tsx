import { cookies } from "next/headers"
import UserInfoForm from "@/components/user/user-info-form"
import { User } from "@/lib/types"
import ChangePasswordForm from "@/components/user/change-password-form"

export default async function Profile() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const user: User = await getUser(token)
  return (
    <main className="flex flex-1 w-full flex-col px-10 md:px-16 lg:px-24 pb-16">
      <div className="grid grid-cols-12 w-full space-y-6 lg:space-y-0 lg:gap-10">
        <UserInfoForm user={user} />
        <ChangePasswordForm />
      </div>
    </main>
  )
}

const getUser = async (token: string | undefined) => {
  const response = await fetch(`${process.env.API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}
