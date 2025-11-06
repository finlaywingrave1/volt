// PKCE helper functions for secure OAuth flow
import crypto from "crypto"

export function generateCodeVerifier(): string {
  return base64URLEncode(crypto.randomBytes(32))
}

export function generateCodeChallenge(verifier: string): string {
  return base64URLEncode(crypto.createHash("sha256").update(verifier).digest())
}

export function generateState(): string {
  return base64URLEncode(crypto.randomBytes(16))
}

function base64URLEncode(buffer: Buffer): string {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}
