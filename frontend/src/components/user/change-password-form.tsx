"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader } from "@tabler/icons-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  type ChangePasswordData,
  changePasswordSchema,
} from "@/schemas/change-password-form.schema"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"

export default function ChangePasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  const onSubmit = async (values: ChangePasswordData) => {
    console.log(values)

    setServerError(null)

    try {
      const res = await fetch("/api/dashboard/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.message || "Update failed")
      }
    } catch (e) {
      setServerError("Something went wrong. Please try again.")
      console.log(e)
    }
  }
  return (
    <Card className="col-span-12 lg:col-span-6">
      <CardHeader>
        <CardTitle>Update Your Password</CardTitle>
        <CardDescription>Update your password from here</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </div>
          ) : null}

          <FieldGroup>
            <Field data-invalid={Boolean(errors.current_password)}>
              <FieldLabel htmlFor="current_password">
                Current Password
              </FieldLabel>

              <Input
                id="current_password"
                type="password"
                placeholder="Current Password"
                autoComplete="current_password"
                aria-invalid={Boolean(errors.current_password)}
                disabled={isSubmitting}
                {...register("current_password")}
              />

              {errors.current_password ? (
                <FieldError>{errors.current_password.message}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={Boolean(errors.new_password)}>
              <FieldLabel htmlFor="new_password">New Password</FieldLabel>

              <Input
                id="new_password"
                type="password"
                placeholder="New Password"
                autoComplete="New Password"
                aria-invalid={Boolean(errors.new_password)}
                disabled={isSubmitting}
                {...register("new_password")}
              />

              {errors.new_password ? (
                <FieldError>{errors.new_password.message}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={Boolean(errors.confirm_password)}>
              <FieldLabel htmlFor="confirm_password">
                Confirm Password
              </FieldLabel>

              <Input
                id="confirm_password"
                type="password"
                placeholder="Confirm Password"
                autoComplete="Confirm Password"
                aria-invalid={Boolean(errors.confirm_password)}
                disabled={isSubmitting}
                {...register("confirm_password")}
              />

              {errors.confirm_password ? (
                <FieldError>{errors.confirm_password.message}</FieldError>
              ) : null}
            </Field>

            <Field>
              <Button
                type="submit"
                className="relative w-full"
                disabled={isSubmitting}
              >
                <span>Update</span>

                {isSubmitting ? (
                  <IconLoader className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin" />
                ) : null}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
