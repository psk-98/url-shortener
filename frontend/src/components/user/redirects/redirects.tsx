import { Redirect } from "@/lib/types"
import { RedirectsTableWrapper } from "./redirects-table-wrapper"
import { cookies } from "next/headers"

export default async function Redirects() {
  const cookieStore = await cookies()

  const token = cookieStore.get("access_token")?.value
  const redirects: Redirect[] = await getRedirects(token)

  return <RedirectsTableWrapper initialRedirects={redirects.data} />
}

const getRedirects = async (token: string | null) => {
  const res = await fetch(`${process.env.API_URL}/redirects`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    method: "GET",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch top redirects")
  }

  return res.json()
}
