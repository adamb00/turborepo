import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@workspace/database"
import NextAuth from "next-auth"
import type { Session } from "next-auth"
import authConfig from "./auth.config"

type AuthRouteHandler = (request: Request) => Response | Promise<Response>
type AuthRouteHandlers = {
  GET: AuthRouteHandler
  POST: AuthRouteHandler
}
type SignInOptions = {
  redirect?: boolean
  redirectTo?: string
} & Record<string, string | boolean | undefined>
type SignInAuthorizationParams =
  | string
  | URLSearchParams
  | string[][]
  | Record<string, string>
type SignIn = (
  provider?: string,
  options?: SignInOptions | FormData,
  authorizationParams?: SignInAuthorizationParams
) => Promise<void>
type SignOut = (options?: SignInOptions) => Promise<void>
type AuthMiddlewareResult = Response | void | Promise<Response | void>
type Auth = {
  (): Promise<Session | null>
  (
    handler: (req: any) => AuthMiddlewareResult
  ): (...args: any[]) => AuthMiddlewareResult
}

const nextAuthResult = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
})

const handlers = nextAuthResult.handlers as AuthRouteHandlers
const auth = nextAuthResult.auth as unknown as Auth
const signIn = nextAuthResult.signIn as SignIn
const signOut = nextAuthResult.signOut as SignOut

export { handlers, auth, signIn, signOut }
export { authConfig }
export { AuthError } from "next-auth"
