"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { LoginSchema, LoginValues } from "@workspace/validation"
import Link from "next/link"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { loginAction, LoginType } from "./action"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [loginType, setLoginType] = useState<LoginType>("credentials")
  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleOnSubmit = async (values: LoginValues) => {
    const res = await loginAction(values, loginType)
    if (res?.error) setError(res.error)
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex w-1/3 flex-col">
        <Card>
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
                        <div className="flex items-center">
                          <FieldLabel htmlFor="password">Jelszó</FieldLabel>
                          <Link
                            href="/auth/forgot-password"
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                          >
                            Elfelejtetted a jelszavad?
                          </Link>
                        </div>
                        <Input
                          {...field}
                          id="password"
                          type="password"
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
                    onClick={() => setLoginType("credentials")}
                    className="cursor-pointer"
                  >
                    Bejelentkezés
                  </Button>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setLoginType("google")}
                    type="submit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Bejelentkezés Google használatával
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
