"use client"
import { useForm } from "react-hook-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  UserInfoFormData,
  userInfoFormSchema,
} from "@/schemas/user-info-form.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { IconLoader } from "@tabler/icons-react"

export default function UserInfoForm({ user }) {
  const [serverError, setServerError] = useState<string | null>(null)

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

  const onSubmit = async (data: UserInfoFormData) => {
    console.log(data)
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Your Info</CardTitle>
        <CardDescription>
          Enter your email or username below to login to your account
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
          </FieldGroup>

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
        </form>
      </CardContent>
    </Card>
  )
}
