import { z } from "zod"
import { UserRole } from "./user.schema"

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).nullable().optional(),
  role: UserRole,
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
})

export type CreateUserValues = z.infer<typeof CreateUserSchema>
