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
      baseUrl: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmTerm: "",
      utmContent: "",
      customFields: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customFields",
  })

  const watchedValues = useWatch({ control: form.control })

  const generatedUrl = useMemo(() => {
    const baseUrl = watchedValues.baseUrl

    if (!baseUrl) {
      return ""
    }
    try {
      const url = new URL(baseUrl)

      if (watchedValues.utmSource) {
        url.searchParams.set("utm_source", watchedValues.utmSource)
      }

      if (watchedValues.utmMedium) {
        url.searchParams.set("utm_medium", watchedValues.utmMedium)
      }

      if (watchedValues.utmCampaign) {
        url.searchParams.set("utm_campaign", watchedValues.utmCampaign)
      }

      if (watchedValues.utmTerm) {
        url.searchParams.set("utm_term", watchedValues.utmTerm)
      }

      if (watchedValues.utmContent) {
        url.searchParams.set("utm_content", watchedValues.utmContent)
      }

      watchedValues.customFields?.forEach((field) => {
        if (field?.key && field?.value) {
          url.searchParams.set(field.key, field.value)
        }
      })

      return url.toString()
    } catch {
      return ""
    }
  }, [watchedValues])

  function onSubmit(data: UtmGeneratorformData) {
    console.log("Valid form data:", data)
    console.log("Generated URL:", generatedUrl)
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>UTM Generator</CardTitle>
        <CardDescription>
          Build a trackable URL using UTM parameters and optional custom fields.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="baseUrl">Website URL</FieldLabel>
              <Input
                id="baseUrl"
                placeholder="https://example.com"
                aria-invalid={!!form.formState.errors.baseUrl}
                {...form.register("baseUrl")}
              />
              <FieldDescription>
                This is the page users will land on.
              </FieldDescription>
              <FieldError>{form.formState.errors.baseUrl?.message}</FieldError>
            </Field>
          </FieldGroup>

          <Separator />

          <FieldSet>
            <FieldGroup className="grid gap-4 md:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="utmSource">UTM Source</FieldLabel>
                <Input
                  id="utmSource"
                  placeholder="google"
                  aria-invalid={!!form.formState.errors.utmSource}
                  {...form.register("utmSource")}
                />
                <FieldDescription>Example: google, facebook</FieldDescription>
                <FieldError>
                  {form.formState.errors.utmSource?.message}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="utmMedium">UTM Medium</FieldLabel>
                <Input
                  id="utmMedium"
                  placeholder="cpc"
                  aria-invalid={!!form.formState.errors.utmMedium}
                  {...form.register("utmMedium")}
                />
                <FieldDescription>Example: cpc, email, social</FieldDescription>
                <FieldError>
                  {form.formState.errors.utmMedium?.message}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="utmCampaign">UTM Campaign</FieldLabel>
                <Input
                  id="utmCampaign"
                  placeholder="summer_sale"
                  aria-invalid={!!form.formState.errors.utmCampaign}
                  {...form.register("utmCampaign")}
                />
                <FieldDescription>Example: black_friday</FieldDescription>
                <FieldError>
                  {form.formState.errors.utmCampaign?.message}
                </FieldError>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="utmTerm">UTM Term</FieldLabel>
                <Input
                  id="utmTerm"
                  placeholder="running_shoes"
                  {...form.register("utmTerm")}
                />
                <FieldDescription>
                  Optional. Usually used for paid search keywords.
                </FieldDescription>
                <FieldError>
                  {form.formState.errors.utmTerm?.message}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="utmContent">UTM Content</FieldLabel>
                <Input
                  id="utmContent"
                  placeholder="banner_a"
                  {...form.register("utmContent")}
                />
                <FieldDescription>
                  Optional. Used to separate ads, buttons or creatives.
                </FieldDescription>
                <FieldError>
                  {form.formState.errors.utmContent?.message}
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
                  <FieldLabel htmlFor={`customFields.${index}.key`}>
                    Field Name
                  </FieldLabel>
                  <Input
                    id={`customFields.${index}.key`}
                    placeholder="campaign_id"
                    aria-invalid={
                      !!form.formState.errors.customFields?.[index]?.key
                    }
                    {...form.register(`customFields.${index}.key`)}
                  />
                  <FieldDescription>
                    Example: campaign_id or ref
                  </FieldDescription>
                  <FieldError>
                    {form.formState.errors.customFields?.[index]?.key?.message}
                  </FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`customFields.${index}.value`}>
                    Field Value
                  </FieldLabel>
                  <Input
                    id={`customFields.${index}.value`}
                    placeholder="12345"
                    aria-invalid={
                      !!form.formState.errors.customFields?.[index]?.value
                    }
                    {...form.register(`customFields.${index}.value`)}
                  />
                  <FieldDescription>
                    The value for this custom parameter.
                  </FieldDescription>
                  <FieldError>
                    {
                      form.formState.errors.customFields?.[index]?.value
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
            <Button type="submit">Save URL</Button>

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
