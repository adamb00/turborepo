import { NextResponse } from "next/server"

export async function PATCH(request: Request) {
  const body = await request.json()
  const res = await fetch(`${process.env.API_URL}/users/reset-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  const data = await res.json().catch(() => null)

  return NextResponse.json(data, { status: res.status })
}
