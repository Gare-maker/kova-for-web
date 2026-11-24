import { NextResponse } from "next/server";
import { findUserAccount, getReceiptsByUserId, getUserById } from "@/lib/db";
import {
  ACCOUNT_COOKIE_NAME,
  getAuthenticatedUserId,
  signUserId,
} from "@/lib/session";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ authenticated: false, user: null, receipts: [] });
  }
  const user = getUserById(userId);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null, receipts: [] });
  }
  const { passwordHash: _ignored, ...safeUser } = user;
  void _ignored;
  const receipts = getReceiptsByUserId(user.id);
  return NextResponse.json({ authenticated: true, user: safeUser, receipts });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    if (!email || !phone) {
      return NextResponse.json(
        { error: "Please enter both your email address and phone number." },
        { status: 400 }
      );
    }

    const user = findUserAccount(email, phone);
    if (!user) {
      return NextResponse.json(
        {
          error:
            "No account or receipt history found for that email and phone number.",
        },
        { status: 404 }
      );
    }

    const { passwordHash: _ignored, ...safeUser } = user;
    void _ignored;
    const receipts = getReceiptsByUserId(user.id);
    const res = NextResponse.json({ authenticated: true, user: safeUser, receipts });
    res.cookies.set(ACCOUNT_COOKIE_NAME, signUserId(user.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "Unable to sign in." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ACCOUNT_COOKIE_NAME);
  return res;
}
