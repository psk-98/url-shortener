"use client"

import { IconCheck, IconCopy } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

type Redirect = {
  id: number
  url: string
  visit_count: number
  alias: string
}

export default function RedirectsTable({
  redirects,
}: {
  redirects: Redirect[]
}) {
  const { copyToClipboard, copiedText, isCopied } = useCopyToClipboard()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const handleCopy = async (url: string) => {
    await copyToClipboard(url)
  }

  return (
    <div className="rounded-md border min-w-8/12 my-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL Link</TableHead>
            <TableHead>Copy</TableHead>
            <TableHead className="text-right">Visit Count</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {redirects.map((link) => {
            const rowCopied = isCopied && copiedText === link.url

            return (
              <TableRow key={link.id}>
                <TableCell className="font-medium">
                  <a
                    href={`${baseUrl}${link.alias}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    {`${baseUrl}${link.alias}`}
                  </a>
                </TableCell>

                <TableCell>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(`${baseUrl}${link.alias}`)}
                  >
                    {rowCopied ? <IconCheck /> : <IconCopy />}
                  </Button>
                </TableCell>

                <TableCell className="text-right">{link.visit_count}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
