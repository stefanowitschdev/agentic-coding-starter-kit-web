import { createElement } from "react"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { ResetPasswordEmail } from "@/emails/reset-password-email"
import { VerificationEmail } from "@/emails/verification-email"
import { db } from "./db"
import { sendMail } from "./mail"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Reset your password",
        react: createElement(ResetPasswordEmail, { url }),
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Verify your email address",
        react: createElement(VerificationEmail, { url }),
      })
    },
  },
})
