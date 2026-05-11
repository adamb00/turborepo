import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicApiRoutes,
  publicRoutes,
} from "@/routes"
import { auth } from "@workspace/auth"
type ProxyHandler = (
  ...args: any[]
) => Response | void | Promise<Response | void>

const proxy: ProxyHandler = auth((req) => {
  const { nextUrl, auth } = req
  const isLoggedIn = !!auth

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isPublicApiRoute = publicApiRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  if (isApiAuthRoute || isPublicApiRoute) {
    return
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return
  }

  if (!isLoggedIn && !isPublicRoute && !isPublicApiRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl))
  }

  return
})

export default proxy

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
