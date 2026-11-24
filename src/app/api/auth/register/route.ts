import { NextResponse } from "next/server";
import { registerBuyerAccount } from "@/lib/db";
import { ACCOUNT_COOKIE_NAME, signUserId } from "@/lib/session";

async function dispatchConfirmationEmail(params: {
  email: string;
  name: string;
  usernameOrBusiness: string;
}): Promise<boolean> {
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
          to: [params.email],
          subject: "Welcome to Kova — Buyer Account Confirmed",
          html: `<p>Hi ${params.name},</p><p>Your Kova Buyer account (<strong>${params.usernameOrBusiness}</strong>) has been created successfully. You can now complete payments and access your PDF receipts anytime.</p>`,
        }),
      });
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const firstAndMiddleName = String(body.firstAndMiddleName ?? "").trim();
    const surname = String(body.surname ?? "").trim();
    const usernameOrBusiness = String(body.usernameOrBusiness ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    if (
      !firstAndMiddleName ||
      !surname ||
      !usernameOrBusiness ||
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

    const nameParts = firstAndMiddleName.split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      return NextResponse.json(
        {
          error:
            "Please enter both your First Name and Middle Name (two names).",
        },
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
      firstAndMiddleName,
      surname,
      usernameOrBusiness,
      email,
      phone,
      password,
    });

    if (result.error || !result.user) {
      return NextResponse.json(
        { error: result.error ?? "Unable to create Buyer account." },
        { status: 409 }
      );
    }

    const emailSent = await dispatchConfirmationEmail({
      email: result.user.email,
      name: result.user.name,
      usernameOrBusiness: result.user.usernameOrBusiness,
    });

    const { passwordHash: _ignored, ...safeUser } = result.user;
    void _ignored;

    const res = NextResponse.json({
      user: safeUser,
      confirmationEmailSent: emailSent,
      message: `Buyer account created! A confirmation email has been sent to ${safeUser.email}.`,
    });

    res.cookies.set(ACCOUNT_COOKIE_NAME, signUserId(result.user.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: "Invalid registration request." },
      { status: 400 }
    );
  }
}

