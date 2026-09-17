// Edge-safe (Web Crypto) HMAC session token, used by middleware.ts and the
// login/logout API routes to gate the whole app behind a shared passcode.

const SESSION_COOKIE = "nagoya_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 45; // 45 days — covers the observation window plus reporting afterward

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = base64UrlDecode(a);
  const bufB = base64UrlDecode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) diff |= bufA[i] ^ bufB[i];
  return diff === 0;
}

export async function createSessionCookieValue(secret: string): Promise<string> {
  const expires = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = String(expires);
  const signature = await hmac(secret, payload);
  return `${payload}.${signature}`;
}

export async function verifySessionCookieValue(secret: string, value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  const expected = await hmac(secret, payload);
  if (!timingSafeEqual(signature, expected)) return false;
  return Date.now() < Number(payload);
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };
