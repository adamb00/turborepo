import { z } from "zod"

export const UserRole = z.enum(["ADMIN", "USER"])
export type UserRole = z.infer<typeof UserRole>

export const UserSchema = z.object({
  id: z.cuid(),
  name: z.string().nullable(),
  password: z
    .string()
    .min(1, "Kérjük adja meg a jelszavát")
    .min(8, "A jelszónak legalább 8 karakternek kell lennie")
    .max(32, "A jelszó legfeljebb 32 karakter lehet")
    .regex(
      /[!@#$%^&*(),.?":{}|<>+\-=_/\\]/,
      "A jelszónak legalább 1 speciális karaktert tartalmaznia kell"
    )
    .regex(/[A-Z]/, "A jelszónak legalább 1 nagybetűt tartalmaznia kell")
    .regex(/[a-z]/, "A jelszónak legalább 1 kisbetűt tartalmaznia kell"),
  email: z.string(),
  role: UserRole,
  avatar: z.string().nullable(),
  createdAt: z.date(),
  last_logged_in: z.date().optional(),
  email_verified: z.date().optional(),
  password_updated_at: z.date().optional(),
})

export type User = z.infer<typeof UserSchema>
