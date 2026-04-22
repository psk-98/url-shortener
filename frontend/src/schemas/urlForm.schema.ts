import z from "zod"

export const urlFormSchema = z.object({
  url: z.url("Enter a valid URL").min(1, "Please enter a URL"),
})

export type URLFormData = z.infer<typeof urlFormSchema>
