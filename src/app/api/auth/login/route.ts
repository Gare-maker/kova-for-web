import { NextResponse } from "next/server";
import { authenticateBuyer } from "@/lib/db";
import { ACCOUNT_COOKIE_NAME, signUserId } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter your email address and password." },
        { status: 400 }
      );
    }

    const result = authenticateBuyer(email, password);
    if (result.error || !result.user) {
      return NextResponse.json(
        { error: result.error ?? "Invalid email or password." },
        { status: 401 }
      );
    }

    const { passwordHash: _ignored, ...safeUser } = result.user;
    void _ignored;

    const res = NextResponse.json({ user: safeUser });
    res.cookies.set(ACCOUNT_COOKIE_NAME, signUserId(result.user.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "Invalid login request." },
      { status: 400 }
    );
  }
}

