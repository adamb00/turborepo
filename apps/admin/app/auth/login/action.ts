"use server"

import { signIn, AuthError } from "@workspace/auth"
import { LoginSchema, LoginValues } from "@workspace/validation"

export type LoginType = "credentials" | "google"

export const loginAction = async (
  values: LoginValues,
  loginType: LoginType
) => {
  const validatedFields = await LoginSchema.safeParseAsync(values)
  if (!validatedFields.success)
    return { error: "Hibás adatok. Kérjük próbáld meg újból!" }

  const { email, password } = validatedFields.data
  try {
    switch (loginType) {
      case "credentials":
        await signIn("credentials", {
          email,
          password,
          redirectTo: "/",
        })
        break
      case "google":
        await signIn("google")
    }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Sikertelen azonosítás. Kérjük próbáld meg újból!" }
        default:
          return { error: "Valami hiba történt! Kérjük próbáld meg újból!" }
      }
    }
    throw error
  }
}
