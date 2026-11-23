import crypto from "crypto";
import { cookies } from "next/headers";

export const ACCOUNT_COOKIE_NAME = "kova_account";

function getSecret(): string {
  return process.env.KOVA_SESSION_SECRET || "kova-dev-session-secret-2026";
}

export function signUserId(userId: string): string {
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(userId)
    .digest("hex");
  return `${userId}.${sig}`;
}

export function verifySignedUserId(cookieVal: string | undefined | null): string | null {
  if (!cookieVal || !cookieVal.includes(".")) return null;
  const idx = cookieVal.lastIndexOf(".");
  const userId = cookieVal.slice(0, idx);
  const sig = cookieVal.slice(idx + 1);
  if (!userId || !sig) return null;

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(userId)
    .digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }
  return userId;
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const store = await cookies();
  const val = store.get(ACCOUNT_COOKIE_NAME)?.value;
  return verifySignedUserId(val);
}

