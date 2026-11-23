import { NextResponse } from "next/server";
import { findUserAccount, getReceiptsByUserId, readDb } from "@/lib/db";
import {
  ACCOUNT_COOKIE_NAME,
  getAuthenticatedUserId,
  signUserId,
} from "@/lib/session";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ user: null, receipts: [] });
  }
  const db = readDb();
  const user = db.users.find((u) => u.id === userId) ?? null;
  if (!user) {
    return NextResponse.json({ user: null, receipts: [] });
  }
  const receipts = getReceiptsByUserId(user.id);
  return NextResponse.json({ user, receipts });
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

    const receipts = getReceiptsByUserId(user.id);
    const res = NextResponse.json({ user, receipts });
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

