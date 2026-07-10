"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader } from "@tabler/icons-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  type UserInfoFormData,
  userInfoFormSchema,
} from "@/schemas/user-info-form.schema"
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
import { User } from "@/lib/types"

export default function UserInfoForm( { user }: { user: User }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserInfoFormData>({
    resolver: zodResolver(userInfoFormSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
    },
  })

  const onSubmit = async (values: UserInfoFormData) => {
    console.log(values)

    setServerError(null)
    setIsSuccess(false)

    try {
      const res = await fetch("/api/dashboard/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.message || "Update failed")
      } else {
        setIsSuccess(true)
      }
    } catch (e) {
      setServerError("Something went wrong. Please try again.")
      console.log(e)
    }
  }
  return (
    <Card className="col-span-12 lg:col-span-6">
      <CardHeader>
        <CardTitle>Update Your Info</CardTitle>
        <CardDescription>
          Update your username and/or your email
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </div>
          ) : null}

          {isSuccess ? (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
              Update successful
            </div>
          ) : null}

          <FieldGroup>
            <Field data-invalid={Boolean(errors.username)}>
              <FieldLabel htmlFor="username">Username</FieldLabel>

              <Input
                id="username"
                type="text"
                placeholder="Username"
                autoComplete="username"
                aria-invalid={Boolean(errors.username)}
                disabled={isSubmitting}
                {...register("username")}
              />

              {errors.username ? (
                <FieldError>{errors.username.message}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>

              <Input
                id="email"
                type="text"
                placeholder="Email"
                autoComplete="Email"
                aria-invalid={Boolean(errors.email)}
                disabled={isSubmitting}
                {...register("email")}
              />

              {errors.email ? (
                <FieldError>{errors.email.message}</FieldError>
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
