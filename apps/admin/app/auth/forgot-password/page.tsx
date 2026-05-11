"use client"
import { zodResolver } from "@hookform/resolvers/zod"
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
import React, { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  ForgotPasswordSchema,
  ForgotPasswordValues,
} from "@workspace/validation"
import { Button } from "@workspace/ui/components/button"
import { useRouter } from "next/navigation"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"

export default function page() {
  const [error, setError] = useState("")
  const router = useRouter()
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const handleOnSubmit = async (values: ForgotPasswordValues) => {
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
      cache: "no-store",
    })
    if (!res.ok) {
      setError("Verification failed")
      return
    }
    router.push(DEFAULT_LOGIN_REDIRECT)
  }
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex w-1/3 flex-col">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Elfelejtett jelszó visszaállítása
            </CardTitle>
            <CardDescription>
              Kérlek add meg az email címed a visszaállítás megkezdéséhez
            </CardDescription>
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
                <p className="self-center text-xs text-red-500">{error}</p>
                <Field>
                  <Button
                    type="submit"
                    className="flex w-auto! cursor-pointer self-end"
                  >
                    Elfelejtettem a jelszavam
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
