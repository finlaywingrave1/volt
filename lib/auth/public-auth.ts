import { handleAuth, handleLogin, handleLogout, handleCallback } from "@auth0/nextjs-auth0/edge"

export { handleAuth, handleLogin, handleLogout, handleCallback }

// Public Auth0 configuration
export const publicAuthConfig = {
  baseURL: "https://voltradio.lol",
  clientID: "bUdRii4Iqay7FzzeensBDGawm6UJUgIc",
  clientSecret: "jklMOHGxMEloq3Dd5zbm9mGyZcHXnFrarf41K43FjLEZbfHJVcK18zqcXzQz10A2",
  issuerBaseURL: "https://dev-t1z23z6ohqwi57h7.us.auth0.com",
  routes: {
    callback: "/api/auth/callback",
    postLogoutRedirect: "/",
  },
  secret: "VOLT_RADIO_PUBLIC_SECRET_KEY_DO_NOT_SHARE",
}
