import { NextResponse } from "next/server";
import { registerBuyerAccount } from "@/lib/db";

async function dispatchVerificationEmail(params: {
  email: string;
  name: string;
  verifyUrl: string;
}): Promise<{ sent: boolean; provider: "resend" | "local" }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.KOVA_EMAIL_FROM || "Kova <onboarding@kovadml.com>",
          to: [params.email],
          subject: "Verify your Kova Buyer account",
          html: `<p>Hi ${params.name},</p><p>Welcome to Kova Showroom! Please verify your email address to finish creating your Buyer account:</p><p><a href="${params.verifyUrl}" style="display:inline-block;padding:10px 18px;background:#2C9B43;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Verify Email Address</a></p><p>This verification link expires in 24 hours.</p>`,
        }),
      });
      return { sent: res.ok, provider: "resend" };
    } catch {
      return { sent: false, provider: "resend" };
    }
  }
  return { sent: true, provider: "local" };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const firstName = String(
      body.firstName ?? body.firstAndMiddleName ?? ""
    ).trim();
    const lastName = String(body.lastName ?? body.surname ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");
    const nextPath =
      typeof body.next === "string" && body.next.startsWith("/")
        ? body.next
        : "/";

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const result = registerBuyerAccount({
      firstName,
      lastName,
      email,
      phone,
      password,
    });

    if (result.error || !result.user || !result.verificationToken) {
      return NextResponse.json(
        { error: result.error ?? "Unable to create Buyer account." },
        { status: 409 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";
    const verifyRelative = `/verify-email?token=${encodeURIComponent(
      result.verificationToken
    )}&next=${encodeURIComponent(nextPath)}`;
    const verifyUrl = `${origin}${verifyRelative}`;

    const mail = await dispatchVerificationEmail({
      email: result.user.email,
      name: result.user.name,
      verifyUrl,
    });

    const { passwordHash: _p, verificationToken: _t, ...safeUser } = result.user;
    void _p;
    void _t;

    return NextResponse.json({
      requiresVerification: true,
      user: safeUser,
      verificationEmailSent: mail.sent,
      verificationPreviewUrl:
        mail.provider === "local" ? verifyRelative : null,
      message: `Verification email sent to ${safeUser.email}. Please check your inbox and click the link to verify your Buyer account.`,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid registration request." },
      { status: 400 }
    );
  }
}
