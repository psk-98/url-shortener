import z from "zod"

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be 30 characters or less")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores",
  )

const emailSchema = z.email("Enter a valid email address")

export const loginFormSchema = z.object({
  username: z.string().trim().min(1, "Username or email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
})

export type LoginFormData = z.infer<typeof loginFormSchema>
