import z from "zod"

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const ResetPasswordSchema = z
  .object({
    email: z.string().email(),
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
    passwordAgain: z.string({
      message: "Kérjük adja meg a jelszavát újra",
    }),
    token: z.string(),
  })
  .refine((data) => data.password === data.passwordAgain, {
    path: ["passwordAgain"],
    message: "A két jelszónak egyeznie kell",
  })

export type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>
export type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>
