"use client"

import { Input } from "@/components/ui/input"
import { LoginFormData, loginFormSchema } from "@/schemas/loginForm.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Button } from "../ui/button"
import { IconLoader } from "@tabler/icons-react"

export function LoginForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormData) {
    setServerError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        setServerError(data.message || "Login failed")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (e) {
      setServerError("Something went wrong. Please try again.")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Use your username or email address to sign in.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </div>
          ) : null}

          <FieldGroup>
            <Field data-invalid={Boolean(errors.username)}>
              <FieldLabel htmlFor="username_email">
                Username or email
              </FieldLabel>

              <Input
                id="username_email"
                type="text"
                placeholder="Username or email"
                autoComplete="username"
                aria-invalid={Boolean(errors.username)}
                disabled={isSubmitting}
                {...register("username")}
              />

              {errors.username ? (
                <FieldError>{errors.username.message}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password">Password</FieldLabel>

              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                disabled={isSubmitting}
                {...register("password")}
              />

              {errors.password ? (
                <FieldError>{errors.password.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            className="relative w-full"
            disabled={isSubmitting}
          >
            <span>Login</span>

            {isSubmitting ? (
              <IconLoader className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin" />
            ) : null}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
