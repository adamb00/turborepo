import { prisma } from "@workspace/database"
import { LoginSchema } from "@workspace/validation"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"

const getRequiredEnv = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key]
    if (value) return value
  }
  throw new Error(`Missing required env var. Tried: ${keys.join(", ")}`)
}

const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/error",
  },
  providers: [
    Google({
      clientId: getRequiredEnv("AUTH_GOOGLE_ID", "GOOGLE_CLIENT_ID"),
      clientSecret: getRequiredEnv(
        "AUTH_GOOGLE_SECRET",
        "GOOGLE_CLIENT_SECRET"
      ),
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials)

        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) return null

        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) return null

        return { ...user }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, emailVerified: true },
      })

      if (!existingUser?.emailVerified) return false

      if (account?.provider !== "google") return true

      return true
    },

    async jwt({ token, user, profile }) {
      if (user) {
        const profilePicture =
          typeof profile === "object" && profile
            ? (profile as Record<string, unknown>).picture
            : undefined
        const avatar =
          (typeof user.image === "string" ? user.image : undefined) ??
          (typeof profilePicture === "string" ? profilePicture : undefined)

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoggedIn: new Date(),
            ...(avatar ? { avatar } : {}),
          },
        })
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { emailVerified: true },
        })
        token.id = user.id
        token.role = user.role
        token.avatar = avatar
        token.email_verified = dbUser?.emailVerified ?? undefined
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email_verified = token.email_verified as Date
        const tokenAvatar =
          typeof token.avatar === "string" ? token.avatar : undefined
        if (tokenAvatar) {
          session.user.image = tokenAvatar
        } else if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { avatar: true },
          })
          session.user.image = dbUser?.avatar ?? null
        } else {
          session.user.image = null
        }
      }

      return session
    },
  },
}

export default authConfig
