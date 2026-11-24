import { NextResponse } from "next/server";
import { verifyUserEmailToken } from "@/lib/db";
import { ACCOUNT_COOKIE_NAME, signUserId } from "@/lib/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";

  const result = verifyUserEmailToken(token);
  if (result.status !== "verified" || !result.user) {
    return NextResponse.json(
      {
        status: result.status,
        email: result.email ?? null,
        error:
          result.error ?? "This verification link is invalid or has expired.",
      },
      { status: result.status === "expired" ? 410 : 400 }
    );
  }

  const { passwordHash: _p, verificationToken: _t, ...safeUser } = result.user;
  void _p;
  void _t;

  const res = NextResponse.json({
    status: "verified",
    user: safeUser,
    message: "Your email has been verified and your Buyer account is active.",
  });

  res.cookies.set(ACCOUNT_COOKIE_NAME, signUserId(result.user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}

