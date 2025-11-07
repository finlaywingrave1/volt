import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Initialize the Auth0 client
export const auth0 = new Auth0Client({
  domain: "dev-t1z23z6ohqwi57h7.us.auth0.com",
  clientId: "bUdRii4Iqay7FzzeensBDGawm6UJUgIc",
  clientSecret: "jklMOHGxMEloq3Dd5zbm9mGyZcHXnFrarf41K43FjLEZbfHJVcK18zqcXzQz10A2",
  appBaseUrl: "https://voltradio.lol",
  secret: "supersecretlongrandomstring_replace_this_1234567890",

  authorizationParameters: {
    scope: "openid profile email",
  },
});
