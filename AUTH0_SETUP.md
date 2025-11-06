# Auth0 Setup Instructions

## Environment Variables

Add the following environment variables to your Vercel project or `.env.local` file:

\`\`\`
AUTH0_SECRET='use this command to generate: node -e "console.log(crypto.randomBytes(32).toString('hex'))"'
AUTH0_BASE_URL='http://localhost:3000' (or your production URL)
AUTH0_ISSUER_BASE_URL='https://YOUR_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='YOUR_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_CLIENT_SECRET'
AUTH0_SCOPE='openid profile email'
\`\`\`

## Auth0 Dashboard Configuration

1. Create a new "Regular Web Application" in your Auth0 dashboard
2. Configure the following settings:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback` (add production URL when deploying)
   - **Allowed Logout URLs**: `http://localhost:3000/` (add production URL when deploying)
   - **Allowed Web Origins**: `http://localhost:3000` (add production URL when deploying)

3. Copy your Domain, Client ID, and Client Secret to the environment variables

## Authentication Routes

The following routes are automatically available:
- `/api/auth/login` - Login page
- `/api/auth/logout` - Logout
- `/api/auth/callback` - Auth0 callback handler
- `/api/auth/me` - Get current user info

## Next Steps

After setting up environment variables:
1. Restart your development server
2. The app will use Auth0 for authentication
3. User data will be stored in Auth0 sessions instead of localStorage
