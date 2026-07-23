import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "session";

// Must be set in .env — a long random string (e.g. `openssl rand -base64 32`).
// Never reuse the value you use for anything else, and never commit it.
const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

if (!process.env.SESSION_SECRET) {
  // Fail loudly at startup rather than silently signing tokens with `undefined`.
  throw new Error("SESSION_SECRET is not set. Add it to your .env file.");
}

export type SessionPayload = {
  userId: string;
  role: string;
  email: string;
};

const THIRTY_DAYS = 60 * 60 * 24 * 30;
const ONE_DAY = 60 * 60 * 24;

export async function createSession(payload: SessionPayload, remember: boolean) {
  const maxAgeSeconds = remember ? THIRTY_DAYS : ONE_DAY;

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, // not readable from client-side JS — mitigates XSS token theft
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax", // sent on top-level navigation, blocked on cross-site POSTs (CSRF mitigation)
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    // Expired or tampered token — treat as logged out rather than throwing.
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}