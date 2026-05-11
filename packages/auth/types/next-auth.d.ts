import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role?: string
      email_verified?: Date | null
    }
  }

  interface User {
    role?: string
    email_verified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    avatar?: string
    email_verified?: Date
  }
}
