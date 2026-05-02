// components/redirects/redirects-table-wrapper.tsx

"use client"

import { useMemo, useState } from "react"
import { getRedirectColumns } from "./columns"
import { RedirectsDataTable } from "./redirects-data-table"
import { EditRedirectDialog } from "./edit-redirect-dialog"

export type Redirect = {
  id: number
  alias: string
  url: string
  visits_count: number
  created_on: string
}

const initialRedirects: Redirect[] = [
  {
    id: 1,
    alias: "summer-sale",
    url: "https://example.com/summer-sale",
    visits_count: 124,
    created_on: "2026-05-02",
  },
  {
    id: 2,
    alias: "google",
    url: "https://google.com",
    visits_count: 89,
    created_on: "2026-04-28",
  },
  {
    id: 3,
    alias: "portfolio",
    url: "https://paulkhoza.dev",
    visits_count: 42,
    created_on: "2026-04-21",
  },
]

export function RedirectsTableWrapper() {
  const [redirects, setRedirects] = useState<Redirect[]>(initialRedirects)
  const [selectedRedirect, setSelectedRedirect] = useState<Redirect | null>(
    null,
  )
  const [url, setUrl] = useState("")
  const [copiedId, setCopiedId] = useState<number | null>(null)

  function openEditDialog(redirect: Redirect) {
    setSelectedRedirect(redirect)
    setUrl(redirect.url)
  }

  function closeEditDialog() {
    setSelectedRedirect(null)
    setUrl("")
  }

  async function copyUrl(redirect: Redirect) {
    await navigator.clipboard.writeText(redirect.url)

    setCopiedId(redirect.id)

    setTimeout(() => {
      setCopiedId(null)
    }, 1500)
  }

  function updateRedirectUrl() {
    if (!selectedRedirect) return

    setRedirects((currentRedirects) =>
      currentRedirects.map((redirect) =>
        redirect.id === selectedRedirect.id
          ? {
              ...redirect,
              url,
            }
          : redirect,
      ),
    )

    closeEditDialog()
  }

  const columns = useMemo(
    () =>
      getRedirectColumns({
        copiedId,
        onCopy: copyUrl,
        onEdit: openEditDialog,
      }),
    [copiedId],
  )

  return (
    <>
      <RedirectsDataTable columns={columns} data={redirects} />

      <EditRedirectDialog
        redirect={selectedRedirect}
        url={url}
        onUrlChange={setUrl}
        onClose={closeEditDialog}
        onSave={updateRedirectUrl}
      />
    </>
  )
}
