import ChangePasswordForm from "@/components/user/change-password-form"
import UserInfoForm from "@/components/user/user-info-form"
import { cookies } from "next/headers"

export default async function Profile() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  const user = await getUser(token)
  return (
    <div>
      {console.log(user)}
      Profile
      <UserInfoForm user={user} />
      <ChangePasswordForm />
    </div>
  )
}

const getUser = async (token) => {
  const response = await fetch(`${process.env.API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}
