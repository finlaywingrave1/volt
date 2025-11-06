import { Auth0Client } from "@auth0/nextjs-auth0/server"

export const auth0 = new Auth0Client({
  clientId: "bUdRii4Iqay7FzzeensBDGawm6UJUgIc",
  clientSecret: "jklMOHGxMEloq3Dd5zbm9mGyZcHXnFrarf41K43FjLEZbfHJVcK18zqcXzQz10A2",
  issuerBaseURL: "https://dev-t1z23z6ohqwi57h7.us.auth0.com",
  baseURL: "https://voltradio.lol",
  secret: "a3f8d9c2e1b4567890abcdef12345678901234567890abcdef1234567890abcd",
  audience: "your_auth_api_identifier",
  scope: "openid profile email read:shows",
})
