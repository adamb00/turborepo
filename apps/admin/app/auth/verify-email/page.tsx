"use client"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { CountdownCircleTimer } from "react-countdown-circle-timer"

export default function page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setError("Missing token or email")
        return
      }

      const requestBody = { token, email }
      const res = await fetch(`/api/verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
      })

      if (!res.ok) {
        setError("Verification failed")
        return
      }

      setIsSuccess(true)
    }

    void verifyEmail()
  }, [token, email])

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      {isSuccess ? (
        <CountdownCircleTimer
          isPlaying
          duration={7}
          size={160}
          strokeWidth={10}
          colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
          colorsTime={[7, 5, 2, 0]}
          onComplete={() => {
            router.push(DEFAULT_LOGIN_REDIRECT)
            return { shouldRepeat: false }
          }}
        >
          {({ remainingTime }) => (
            <div className="text-center">
              <p className="text-2xl font-semibold">{remainingTime}</p>
              <p className="text-sm">Redirecting...</p>
            </div>
          )}
        </CountdownCircleTimer>
      ) : (
        <p>{error}</p>
      )}
    </div>
  )
}
