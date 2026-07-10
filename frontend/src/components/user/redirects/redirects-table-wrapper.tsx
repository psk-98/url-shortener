"use client"

import { useMemo, useState } from "react"
import type { Redirect } from "@/lib/types"
import { getRedirectColumns } from "./columns"
import { EditRedirectDialog } from "./edit-redirect-dialog"
import { RedirectsDataTable } from "./redirects-data-table"

export function RedirectsTableWrapper({ initialRedirects }: { initialRedirects: Redirect[] }) {
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
