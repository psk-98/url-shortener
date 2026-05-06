import z from "zod"

export const userInfoFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or less")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.email("Enter a valid email address").min(1, "Email is required"),
})

export type UserInfoFormData = z.infer<typeof userInfoFormSchema>
