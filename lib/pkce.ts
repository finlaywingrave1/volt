// PKCE helper functions for secure OAuth flow
import crypto from "crypto"  // This is the built-in Node.js crypto module

// Generate a secure code verifier for PKCE flow
export function generateCodeVerifier(): string {
  return base64URLEncode(crypto.randomBytes(32))  // 32 bytes for a secure verifier
}

// Generate the code challenge from the code verifier
export function generateCodeChallenge(verifier: string): string {
  return base64URLEncode(crypto.createHash("sha256").update(verifier).digest())  // Hash the verifier with SHA-256
}

// Generate a secure random state to protect against CSRF attacks
export function generateState(): string {
  return base64URLEncode(crypto.randomBytes(16))  // 16 bytes is a good length for a state parameter
}

// Helper function to encode Buffer to Base64 URL format (for PKCE)
function base64URLEncode(buffer: Buffer): string {
  return buffer.toString("base64")  // Convert buffer to base64
    .replace(/\+/g, "-")            // Replace '+' with '-'
    .replace(/\//g, "_")            // Replace '/' with '_'
    .replace(/=/g, "")              // Remove '=' padding
}