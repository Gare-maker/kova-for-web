import { NextResponse } from "next/server";
import { regenerateVerificationToken } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim();
    const nextPath =
      typeof body.next === "string" && body.next.startsWith("/")
        ? body.next
        : "/";

    if (!email) {
      return NextResponse.json(
        { error: "Please enter your email address." },
        { status: 400 }
      );
    }

    const result = regenerateVerificationToken(email);
    if (result.error || !result.user || !result.verificationToken) {
      return NextResponse.json(
        { error: result.error ?? "Unable to resend verification email." },
        { status: 400 }
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

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.KOVA_EMAIL_FROM || "Kova <onboarding@kovadml.com>",
            to: [result.user.email],
            subject: "Verify your Kova Buyer account",
            html: `<p>Hi ${result.user.name},</p><p>Here is your new verification link for Kova Showroom:</p><p><a href="${verifyUrl}" style="display:inline-block;padding:10px 18px;background:#2C9B43;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Verify Email Address</a></p><p>This link expires in 24 hours.</p>`,
          }),
        });
      } catch {
        // continue
      }
    }

    return NextResponse.json({
      sent: true,
      verificationPreviewUrl: resendKey ? null : verifyRelative,
      message: `A new verification link has been sent to ${result.user.email}.`,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}

