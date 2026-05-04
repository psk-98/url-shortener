"use client"

import { IconCopy, IconEdit } from "@tabler/icons-react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Redirect } from "@/lib/types"

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

        return (
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_URL}${redirect.alias}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium"
          >
            {`${process.env.NEXT_PUBLIC_BASE_URL}${redirect.alias}`}
          </a>
        )
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
        <div className="text-center">{row.original.visit_count}</div>
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
          Created on <ArrowUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.created_at)

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
