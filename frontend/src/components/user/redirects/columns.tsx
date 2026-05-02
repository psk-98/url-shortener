// components/redirects/columns.tsx

"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { IconCopy, IconEdit } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

export type Redirect = {
  id: number
  alias: string
  url: string
  visits_count: number
  created_on: string
}

type GetRedirectColumnsProps = {
  copiedId: number | null
  onCopy: (redirect: Redirect) => void
  onEdit: (redirect: Redirect) => void
}

export function getRedirectColumns({
  copiedId,
  onCopy,
  onEdit,
}: GetRedirectColumnsProps): ColumnDef<Redirect>[] {
  return [
    {
      accessorKey: "alias",
      header: "Short URL",
      cell: ({ row }) => {
        const redirect = row.original

        return <span className="font-medium">/{redirect.alias}</span>
      },
    },
    {
      accessorKey: "url",
      header: "Destination URL",
      cell: ({ row }) => {
        const redirect = row.original

        return (
          <span className="block max-w-[320px] truncate">{redirect.url}</span>
        )
      },
    },
    {
      accessorKey: "visits_count",
      header: ({ column }) => (
        <Button
          variant="ghost"
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Views
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-right">{row.original.visits_count}</div>
      ),
    },
    {
      accessorKey: "created_on",
      header: ({ column }) => (
        <Button
          variant="ghost"
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created on
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.created_on)

        return (
          <span>
            {date.toLocaleDateString("en-ZA", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const redirect = row.original

        return (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCopy(redirect)}
            >
              <IconCopy className="size-4" />
              {copiedId === redirect.id ? "Copied" : "Copy"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(redirect)}
            >
              <IconEdit className="size-4" />
              Edit
            </Button>
          </div>
        )
      },
    },
  ]
}
