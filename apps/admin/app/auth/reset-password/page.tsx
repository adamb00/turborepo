"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { ResetPasswordSchema, ResetPasswordValues } from "@workspace/validation"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { loginAction } from "../login/action"

export default function page() {
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: email ?? "",
      password: "",
      passwordAgain: "",
      token: token ?? "",
    },
  })

  useEffect(() => {
    if (email) {
      form.setValue("email", email, { shouldValidate: true })
    }
    if (token) {
      form.setValue("token", token, { shouldValidate: true })
    }
  }, [email, token, form])

  const handleOnSubmit = async (values: ResetPasswordValues) => {
    const res = await fetch(`/api/reset-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
      cache: "no-store",
    })
    const { message } = await res.json()

    if (!res.ok) {
      setError(message)
      return
    }

    const loginResult = await loginAction(
      { email: values.email, password: values.password },
      "credentials"
    )

    if (loginResult?.error) {
      setError(loginResult.error)
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex w-1/3 flex-col">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Jelszó visszaállítása
            </CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleOnSubmit)}>
              <FieldGroup>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )
                  }}
                />
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field>
                        <FieldLabel htmlFor="password">Jelszó</FieldLabel>
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          required
                          autoComplete="none"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )
                  }}
                />
                <Controller
                  name="passwordAgain"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field>
                        <FieldLabel htmlFor="passwordAgain">
                          Jelszó újra
                        </FieldLabel>
                        <Input
                          {...field}
                          id="passwordAgain"
                          type="password"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )
                  }}
                />
                <p className="text-center text-red-500 italic">{error}</p>
                <Button
                  type="submit"
                  className="flex w-1/3! cursor-pointer self-end"
                >
                  Mentés
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
