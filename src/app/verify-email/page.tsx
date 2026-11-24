"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import { KovaHeader } from "@/components/KovaHeader";
import { KovaFooter } from "@/components/KovaFooter";

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const nextUrl = searchParams.get("next") || "/";

  const [state, setState] = useState<"loading" | "verified" | "expired" | "invalid">("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  const [expiredEmail, setExpiredEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendInfo, setResendInfo] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (!token) {
      setState("invalid");
      setMessage("This verification link is invalid or incomplete.");
      return;
    }

    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!active) return;

        if (res.ok && data.status === "verified") {
          setState("verified");
          setMessage(
            data.message ||
              "Your email has been verified and your Buyer account is active."
          );
          const safeNext = nextUrl.startsWith("/") ? nextUrl : "/";
          setTimeout(() => {
            router.replace(safeNext);
            router.refresh();
          }, 1200);
        } else if (data.status === "expired") {
          setState("expired");
          setExpiredEmail(data.email ?? null);
          setMessage(
            data.error ||
              "This verification link has expired. Please request a new one."
          );
        } else {
          setState("invalid");
          setMessage(
            data.error ||
              "This verification link is invalid or has already been used."
          );
        }
      } catch {
        if (active) {
          setState("invalid");
          setMessage("Unable to verify your email right now. Please try again.");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [token, nextUrl, router]);

  const handleResend = async () => {
    if (!expiredEmail) return;
    setResending(true);
    setResendInfo(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: expiredEmail, next: nextUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendInfo(
          data.message || "A fresh verification link has been sent to your email."
        );
        setPreviewUrl(data.verificationPreviewUrl ?? null);
      } else {
        setResendInfo(data.error || "Unable to resend verification email.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <main id="main" className="storefront-main">
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="surface-card" style={{ textAlign: "center" }}>
          {state === "loading" && (
            <>
              <MailCheck
                size={28}
                color="var(--brand)"
                style={{ margin: "0 auto 0.6rem" }}
              />
              <h1 className="display display--md">Verifying Email...</h1>
              <p style={{ color: "var(--muted)", fontSize: "0.84rem" }}>
                {message}
              </p>
            </>
          )}

          {state === "verified" && (
            <>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--brand-soft)",
                  color: "var(--brand)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 0.65rem",
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <h1 className="display display--md" style={{ color: "var(--ink-strong)" }}>
                Email Verified!
              </h1>
              <p style={{ color: "var(--muted)", fontSize: "0.84rem", margin: "0.35rem 0 0.85rem" }}>
                {message} Redirecting you now...
              </p>
              <Link
                href={nextUrl.startsWith("/") ? nextUrl : "/"}
                className="btn btn--brand btn--sm"
              >
                Continue Now
              </Link>
            </>
          )}

          {(state === "expired" || state === "invalid") && (
            <>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--danger-soft)",
                  color: "var(--danger)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 0.65rem",
                }}
              >
                <AlertCircle size={24} />
              </div>
              <h1 className="display display--md" style={{ color: "var(--ink-strong)" }}>
                {state === "expired"
                  ? "Verification Link Expired"
                  : "Invalid Verification Link"}
              </h1>
              <p style={{ color: "var(--muted)", fontSize: "0.84rem", margin: "0.35rem 0 1rem" }}>
                {message}
              </p>

              {resendInfo && (
                <div
                  style={{
                    background: "var(--brand-soft)",
                    color: "var(--forest)",
                    padding: "0.65rem 0.8rem",
                    borderRadius: 8,
                    fontSize: "0.8rem",
                    marginBottom: "0.85rem",
                  }}
                >
                  {resendInfo}
                  {previewUrl && (
                    <div style={{ marginTop: "0.45rem" }}>
                      <Link
                        href={previewUrl}
                        className="btn btn--brand btn--sm"
                      >
                        Verify Email Now
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {state === "expired" && expiredEmail && (
                  <button
                    type="button"
                    className="btn btn--brand btn--sm"
                    onClick={handleResend}
                    disabled={resending}
                  >
                    <RefreshCw size={13} />
                    {resending ? "Sending..." : "Resend Verification Email"}
                  </button>
                )}
                <Link
                  href={`/register?next=${encodeURIComponent(nextUrl)}`}
                  className="btn btn--outline btn--sm"
                >
                  Back to Buyer Account
                </Link>
                <Link href="/" className="btn btn--ghost btn--sm">
                  Back to Showroom
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <KovaHeader />
      <Suspense
        fallback={
          <div style={{ padding: "2.5rem", textAlign: "center", fontSize: "0.84rem" }}>
            Verifying email...
          </div>
        }
      >
        <VerifyEmailInner />
      </Suspense>
      <KovaFooter />
    </>
  );
}

