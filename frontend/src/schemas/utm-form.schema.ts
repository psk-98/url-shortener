import z from "zod"

export const utmGeneratorFormSchema = z.object({
  baseUrl: z.string().url("Please enter a valid URL"),
  utmSource: z.string().min(1, "UTM source is required"),
  utmMedium: z.string().min(1, "UTM medium is required"),
  utmCampaign: z.string().min(1, "UTM campaign is required"),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  customFields: z.array(
    z.object({
      key: z
        .string()
        .min(1, "Field name is required")
        .regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers and underscores"),
      value: z.string().min(1, "Field value is required"),
    }),
  ),
})

export type UtmGeneratorformData = z.infer<typeof utmGeneratorFormSchema>
