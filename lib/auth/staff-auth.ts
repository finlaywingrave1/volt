import { handleAuth, handleLogin, handleLogout, handleCallback } from "@auth0/nextjs-auth0/edge"

export { handleAuth, handleLogin, handleLogout, handleCallback }

// Staff Auth0 configuration
export const staffAuthConfig = {
  baseURL: "https://voltradio.lol/myvolt",
  clientID: "K8BnYvEm9NPIpktgVz3nEF49BEWQ60wy",
  clientSecret: "Wc-lND7wLoHJzBo62qOgE-HP7dqI5N84ms63Yd6MMdV45XUah39aYehxXURx9x44",
  issuerBaseURL: "https://dev-t1z23z6ohqwi57h7.us.auth0.com",
  routes: {
    callback: "/myvolt/api/auth/callback",
    postLogoutRedirect: "/",
  },
  secret: "VOLT_RADIO_STAFF_SECRET_KEY_DO_NOT_SHARE",
}
