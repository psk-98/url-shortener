"use client"

import { IconCheck, IconCopy } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

type Props = {
  alias: string
  url: string
}

export default function CopyRedirect({ alias, url }: Props) {
  const { copyToClipboard, copiedText, isCopied } = useCopyToClipboard()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const rowCopied = isCopied && copiedText === url

  const handleCopy = async (url: string) => {
    await copyToClipboard(url)
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => handleCopy(`${baseUrl}${alias}`)}
    >
      {rowCopied ? <IconCheck /> : <IconCopy />}
    </Button>
  )
}
