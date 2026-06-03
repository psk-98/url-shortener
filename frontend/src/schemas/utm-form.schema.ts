import z from "zod"

export const utmGeneratorFormSchema = z.object({
  base_url: z.url("Please enter a valid URL"),
  source: z.string().min(1, "UTM source is required"),
  medium: z.string().min(1, "UTM medium is required"),
  campaign: z.string().min(1, "UTM campaign is required"),
  term: z.string().optional(),
  content: z.string().optional(),
  generated_url: z.url().optional(),
  custom_fields: z.array(
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
