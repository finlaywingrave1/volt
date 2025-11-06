// Staff/MyVolt Auth0 client with separate credentials
import { Auth0Client } from "@auth0/nextjs-auth0/server"

export const myvoltAuth0 = new Auth0Client({
  domain: "dev-t1z23z6ohqwi57h7.us.auth0.com",
  clientId: "K8BnYvEm9NPIpktgVz3nEF49BEWQ60wy",
  clientSecret: "Wc-lND7wLoHJzBo62qOgE-HP7dqI5N84ms63Yd6MMdV45XUah39aYehxXURx9x44",
  appBaseUrl: "https://voltradio.lol/myvolt",
  secret: "another_random_secret_here_abcdef1234567890",
  authorizationParameters: {
    scope: "openid profile email",
  },
})
