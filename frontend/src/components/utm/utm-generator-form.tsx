"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import {
  type UtmGeneratorformData,
  utmGeneratorFormSchema,
} from "@/schemas/utm-form.schema"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "../ui/field"
import { Input } from "../ui/input"
import { Separator } from "../ui/separator"
import { Textarea } from "../ui/textarea"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

export default function UtmGeneratorForm() {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const form = useForm<UtmGeneratorformData>({
    resolver: zodResolver(utmGeneratorFormSchema),
    defaultValues: {
      base_url: "",
      source: "",
      medium: "",
      campaign: "",
      term: "",
      content: "",
      generated_url: undefined,
      custom_fields: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "custom_fields",
  })

  const watchedValues = useWatch({ control: form.control })

  const generatedUrl = useMemo(() => {
    const base_url = watchedValues.base_url

    if (!base_url) {
      return ""
    }
    try {
      const url = new URL(base_url)

      if (watchedValues.source) {
        url.searchParams.set("utm_source", watchedValues.source)
      }

      if (watchedValues.medium) {
        url.searchParams.set("utm_medium", watchedValues.medium)
      }

      if (watchedValues.campaign) {
        url.searchParams.set("utm_campaign", watchedValues.campaign)
      }

      if (watchedValues.term) {
        url.searchParams.set("utm_term", watchedValues.term)
      }

      if (watchedValues.content) {
        url.searchParams.set("utm_content", watchedValues.content)
      }

      watchedValues.custom_fields?.forEach((field) => {
        if (field?.key && field?.value) {
          url.searchParams.set(field.key, field.value)
        }
      })

      return url.toString()
    } catch {
      return ""
    }
  }, [watchedValues])

  const onSubmit = async (values: UtmGeneratorformData) => {
    values.generated_url = generatedUrl
    console.log("Valid form data:", values)
    console.log("Generated URL:", generatedUrl)

    const res = await fetch("api/home/utms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Accept: "application/json",
      },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      // const data = await res.json()
      console.log(res)
      return
      // throw new Error(`HTTP error: ${res.status}`)
    }

    const { data } = await res.json()
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>UTM Generator</CardTitle>
        <CardDescription>
          Build a trackable URL using UTM parameters and optional custom fields.
        </CardDescription>
      </CardHeader>
      {console.log(form.formState.errors)}
      <CardContent>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="base_url">Website URL</FieldLabel>
              <Input
                id="base_url"
                placeholder="https://example.com"
                aria-invalid={!!form.formState.errors.base_url}
                {...form.register("base_url")}
              />
              <FieldDescription>
                This is the page users will land on.
              </FieldDescription>
              <FieldError>{form.formState.errors.base_url?.message}</FieldError>
            </Field>
          </FieldGroup>

          <Separator />

          <FieldSet>
            <FieldGroup className="grid gap-4 md:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="source">UTM Source</FieldLabel>
                <Input
                  id="source"
                  placeholder="google"
                  aria-invalid={!!form.formState.errors.source}
                  {...form.register("source")}
                />
                <FieldDescription>Example: google, facebook</FieldDescription>
                <FieldError>{form.formState.errors.source?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="utmMedium">UTM Medium</FieldLabel>
                <Input
                  id="medium"
                  placeholder="cpc"
                  aria-invalid={!!form.formState.errors.medium}
                  {...form.register("medium")}
                />
                <FieldDescription>Example: cpc, email, social</FieldDescription>
                <FieldError>{form.formState.errors.medium?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="campaign">UTM Campaign</FieldLabel>
                <Input
                  id="campaign"
                  placeholder="summer_sale"
                  aria-invalid={!!form.formState.errors.campaign}
                  {...form.register("campaign")}
                />
                <FieldDescription>Example: black_friday</FieldDescription>
                <FieldError>
                  {form.formState.errors.campaign?.message}
                </FieldError>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="term">UTM Term</FieldLabel>
                <Input
                  id="term"
                  placeholder="running_shoes"
                  {...form.register("term")}
                />
                <FieldDescription>
                  Optional. Usually used for paid search keywords.
                </FieldDescription>
                <FieldError>{form.formState.errors.term?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="content">UTM Content</FieldLabel>
                <Input
                  id="content"
                  placeholder="banner_a"
                  {...form.register("content")}
                />
                <FieldDescription>
                  Optional. Used to separate ads, buttons or creatives.
                </FieldDescription>
                <FieldError>
                  {form.formState.errors.content?.message}
                </FieldError>
              </Field>
            </FieldGroup>
          </FieldSet>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium">Custom Fields</h3>
                <p className="text-sm text-muted-foreground">
                  Add extra query parameters if needed.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ key: "", value: "" })}
              >
                Add field
              </Button>
            </div>

            {fields.length === 0 && (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No custom fields added yet.
              </div>
            )}

            {fields.map((item, index) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_1fr_auto]"
              >
                <Field>
                  <FieldLabel htmlFor={`custom_fields.${index}.key`}>
                    Field Name
                  </FieldLabel>
                  <Input
                    id={`custom_fields.${index}.key`}
                    placeholder="campaign_id"
                    aria-invalid={
                      !!form.formState.errors.custom_fields?.[index]?.key
                    }
                    {...form.register(`custom_fields.${index}.key`)}
                  />
                  <FieldDescription>
                    Example: campaign_id or ref
                  </FieldDescription>
                  <FieldError>
                    {form.formState.errors.custom_fields?.[index]?.key?.message}
                  </FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`custom_fields.${index}.value`}>
                    Field Value
                  </FieldLabel>
                  <Input
                    id={`custom_fields.${index}.value`}
                    placeholder="12345"
                    aria-invalid={
                      !!form.formState.errors.custom_fields?.[index]?.value
                    }
                    {...form.register(`custom_fields.${index}.value`)}
                  />
                  <FieldDescription>
                    The value for this custom parameter.
                  </FieldDescription>
                  <FieldError>
                    {
                      form.formState.errors.custom_fields?.[index]?.value
                        ?.message
                    }
                  </FieldError>
                </Field>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <Field>
            <FieldLabel>Generated URL</FieldLabel>
            <Textarea
              readOnly
              value={
                generatedUrl ||
                "Enter a valid website URL to generate your tracking link."
              }
              className="min-h-28 resize-none"
            />
            <FieldDescription>
              This updates live as the user fills in the form.
            </FieldDescription>
          </Field>

          {generatedUrl && (
            <div className="rounded-md bg-muted p-3">
              <p className="break-all text-sm">{generatedUrl}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" onClick={() => form.handleSubmit(onSubmit)}>
              Save URL
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={!generatedUrl}
              onClick={() => copyToClipboard(generatedUrl)}
            >
              {isCopied ? "Copied!" : "Copy URL"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
