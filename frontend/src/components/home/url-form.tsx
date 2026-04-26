"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconCheck, IconCopy } from "@tabler/icons-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { type URLFormData, urlFormSchema } from "@/schemas/urlForm.schema"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group"

export default function URLForm() {
  const { copyToClipboard, isCopied } = useCopyToClipboard()
  const [shortenedURL, setShortenedURL] = useState<string | null>(null)

  const baseApiUrl = process.env.NEXT_PUBLIC_API_URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<URLFormData>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: { url: "" },
  })

  const onSubmit = async (values: URLFormData) => {
    const res = await fetch(`${baseApiUrl}/redirects/guest_redirect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      console.log(res)
      throw new Error(`HTTP error: ${res.status}`)
    }

    const data = await res.json()
    setShortenedURL(data.alias)
  }

  return (
    <form className="mb-6 min-w-10/12" onSubmit={handleSubmit(onSubmit)}>
      {shortenedURL ? (
        <InputGroup>
          <InputGroupInput placeholder={`${baseUrl}${shortenedURL}`} readOnly />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              aria-label="Copy"
              title="Copy"
              size="icon-xs"
              onClick={() => {
                copyToClipboard(`${baseUrl}${shortenedURL}`)
              }}
            >
              {isCopied ? <IconCheck /> : <IconCopy />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      ) : (
        <div className="space-y-1">
          <InputGroup>
            <InputGroupInput
              {...register("url")}
              placeholder="Enter a url.."
              aria-invalid={!!errors.url}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="submit"
                variant="secondary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Shortening..." : "Shorten"}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          {errors.url && (
            <p className="text-sm text-destructive">{errors.url.message}</p>
          )}
        </div>
      )}
    </form>
  )
}
