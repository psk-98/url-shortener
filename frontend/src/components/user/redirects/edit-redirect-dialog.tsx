"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type Redirect = {
  id: number
  alias: string
  url: string
  visits_count: number
  created_on: string
}

type EditRedirectDialogProps = {
  redirect: Redirect | null
  url: string
  onUrlChange: (url: string) => void
  onClose: () => void
  onSave: () => void
}

export function EditRedirectDialog({
  redirect,
  url,
  onUrlChange,
  onClose,
  onSave,
}: EditRedirectDialogProps) {
  return (
    <Dialog
      open={Boolean(redirect)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit redirect URL</DialogTitle>
          <DialogDescription>
            Update the destination URL for this short link.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Label htmlFor="url">Destination URL</Label>
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button type="button" onClick={onSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
