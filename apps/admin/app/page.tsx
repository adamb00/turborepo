import { auth } from "@workspace/auth"

import { redirect } from "next/navigation"

export default async function page() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return <div>Hello {session.user?.email}</div>
}
