// Auth0 configuration - dual config for public and staff apps
export const publicAuthConfig = {
  domain: "dev-t1z23z6ohqwi57h7.us.auth0.com",
  clientId: "bUdRii4Iqay7FzzeensBDGawm6UJUgIc",
  clientSecret: "jklMOHGxMEloq3Dd5zbm9mGyZcHXnFrarf41K43FjLEZbfHJVcK18zqcXzQz10A2",
  audience: "your_auth_api_identifier",
  scope: "openid profile email read:shows",
  baseUrl: "https://voltradio.lol",
  secret: "a7f3e9d2c8b4f1a6e5d9c3b7f2a8e4d1c9b5f3a7e2d8c4b1f6a9e5d2c8b4f1a3",
}

export const staffAuthConfig = {
  domain: "dev-t1z23z6ohqwi57h7.us.auth0.com",
  clientId: "K8BnYvEm9NPIpktgVz3nEF49BEWQ60wy",
  clientSecret: "Wc-lND7wLoHJzBo62qOgE-HP7dqI5N84ms63Yd6MMdV45XUah39aYehxXURx9x44",
  audience: "your_auth_api_identifier",
  scope: "openid profile email",
  baseUrl: "https://voltradio.lol/myvolt",
  secret: "b8e4f1a9d5c2f7e3a9d6c3b8f5a2e9d4c1b6f3a8e5d2c9b4f1a7e4d1c8b5f2a4",
}

export const auth0Config = publicAuthConfig

export const createAuth0Urls = (domain: string) => ({
  authorize: `https://${domain}/authorize`,
  token: `https://${domain}/oauth/token`,
  userInfo: `https://${domain}/userinfo`,
  logout: `https://${domain}/v2/logout`,
})

export const auth0Urls = createAuth0Urls(publicAuthConfig.domain)
