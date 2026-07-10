import { Suspense } from "react"
import ResetPasswordForm from "@/components/auth/reset-password-form"

export default function ResetPassword() {
  return    <Suspense fallback={<div>Loading reset form...</div>}>
<ResetPasswordForm /></Suspense>
}
