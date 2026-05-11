/**
 * An array of routes that are not accessible to the public
 * This routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/auth/login"]

/**
 * API routes that do not require authentication
 * @type {string[]}
 */
export const publicApiRoutes = [
  "/api/users",
  "/api/verification",
  "/api/reset-password",
  "/api/forgot-password",
]

/**
 * An array of routes that are used for authentication
 * This routes will redirect logged in users to /
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/login",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/create-new-user",
]

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth"

export const DEFAULT_LOGIN_REDIRECT = "/"
