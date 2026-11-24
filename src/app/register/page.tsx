"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  MailCheck,
  AlertCircle,
  UserCheck,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { KovaHeader } from "@/components/KovaHeader";
import { KovaFooter } from "@/components/KovaFooter";

function RegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  const [mode, setMode] = useState<"register" | "login">("register");
  const [firstAndMiddleName, setFirstAndMiddleName] = useState("");
  const [surname, setSurname] = useState("");
  const [usernameOrBusiness, setUsernameOrBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerifyEmail, setNeedsVerifyEmail] = useState<string | null>(null);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  const [verifyPreviewUrl, setVerifyPreviewUrl] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const cleanNext = nextUrl.replace(/\?pay=1$/, "");
    router.prefetch(cleanNext.startsWith("/product/") ? cleanNext : "/");
  }, [router, nextUrl]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parts = firstAndMiddleName.trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      setError("Please enter both your First Name and Middle Name (two names).");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstAndMiddleName: firstAndMiddleName.trim(),
          surname: surname.trim(),
          usernameOrBusiness: usernameOrBusiness.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirmPassword,
          next: nextUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to register your Buyer account.");
        return;
      }

      setNeedsVerifyEmail(email.trim());
      setVerifyNotice(
        data.message ||
          `We sent a verification email to ${email.trim()}. Click the verification link to activate your Buyer account.`
      );
      setVerifyPreviewUrl(data.verificationPreviewUrl ?? null);
    } catch {
      setError("Network error while creating account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.status === 403 && data.needsVerification) {
        setNeedsVerifyEmail(email.trim());
        setVerifyNotice(
          data.error || "Please verify your email address before signing in."
        );
        return;
      }
      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }
      router.replace(nextUrl);
      router.refresh();
    } catch {
      setError("Network error while signing in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!needsVerifyEmail) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: needsVerifyEmail, next: nextUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerifyNotice(
          data.message || `Verification link resent to ${needsVerifyEmail}.`
        );
        setVerifyPreviewUrl(data.verificationPreviewUrl ?? null);
      } else {
        setError(data.error || "Unable to resend verification email.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    const cleanNext = nextUrl.replace(/\?pay=1$/, "");
    router.push(cleanNext.startsWith("/product/") ? cleanNext : "/");
  };

  return (
    <>
      <div className="kova-subbar">
        <div className="container kova-subbar__inner">
          <button
            type="button"
            onClick={handleBack}
            className="kova-subbar__left"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      <main id="main" className="storefront-main">
        <div className="container" style={{ maxWidth: 460 }}>
          <div className="surface-card">
            {needsVerifyEmail ? (
              <div style={{ textAlign: "center", paddingBlock: "0.4rem" }}>
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
                  <MailCheck size={22} />
                </div>
                <h1 className="display display--md" style={{ color: "var(--ink-strong)" }}>
                  Verify Your Email
                </h1>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.82rem",
                    margin: "0.35rem 0 0.9rem",
                    lineHeight: 1.5,
                  }}
                >
                  {verifyNotice}
                </p>

                {verifyPreviewUrl && (
                  <div
                    style={{
                      background: "var(--paper-subtle)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "0.75rem",
                      marginBottom: "0.85rem",
                      fontSize: "0.78rem",
                      color: "var(--ink-soft)",
                    }}
                  >
                    <div style={{ marginBottom: "0.5rem" }}>
                      Complete verification directly:
                    </div>
                    <Link
                      href={verifyPreviewUrl}
                      className="btn btn--brand btn--sm"
                    >
                      Verify Email Address
                    </Link>
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
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={handleResendVerification}
                    disabled={resending}
                  >
                    <RefreshCw size={13} />
                    {resending ? "Resending..." : "Resend Verification Email"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => {
                      setNeedsVerifyEmail(null);
                      setMode("login");
                    }}
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "var(--brand-soft)",
                    color: "var(--forest)",
                    padding: "0.24rem 0.6rem",
                    borderRadius: 999,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    marginBottom: "0.65rem",
                  }}
                >
                  <UserCheck size={12} />
                  Account Category: Buyer (Auto-assigned)
                </div>

                <h1
                  className="display display--md"
                  style={{ color: "var(--ink-strong)", marginBottom: "0.2rem" }}
                >
                  {mode === "register"
                    ? "Buyer Registration"
                    : "Sign In to Buyer Account"}
                </h1>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.8rem",
                    margin: "0 0 0.9rem",
                  }}
                >
                  {mode === "register"
                    ? "Create your Kova Buyer account and verify your email to continue to payment."
                    : "Sign in to complete payments and access your receipt history."}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.35rem",
                    marginBottom: "0.95rem",
                    background: "var(--paper-subtle)",
                    padding: "0.22rem",
                    borderRadius: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    style={{
                      padding: "0.42rem",
                      borderRadius: 6,
                      border: "none",
                      background: mode === "register" ? "#ffffff" : "transparent",
                      color:
                        mode === "register"
                          ? "var(--ink-strong)"
                          : "var(--muted)",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    Sign Up (Buyer)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    style={{
                      padding: "0.42rem",
                      borderRadius: 6,
                      border: "none",
                      background: mode === "login" ? "#ffffff" : "transparent",
                      color:
                        mode === "login" ? "var(--ink-strong)" : "var(--muted)",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    Sign In
                  </button>
                </div>

                {error && (
                  <div
                    style={{
                      background: "var(--danger-soft)",
                      color: "var(--danger)",
                      padding: "0.6rem 0.75rem",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      marginBottom: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                {mode === "register" ? (
                  <form onSubmit={handleRegister}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-first-mid">
                        First Name &amp; Middle Name (Two Names) *
                      </label>
                      <input
                        id="reg-first-mid"
                        className="form-input"
                        placeholder="e.g. Chinedu David"
                        value={firstAndMiddleName}
                        onChange={(e) => setFirstAndMiddleName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-surname">
                        Surname *
                      </label>
                      <input
                        id="reg-surname"
                        className="form-input"
                        placeholder="e.g. Okeke"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-username">
                        Username or Business Name *
                      </label>
                      <input
                        id="reg-username"
                        className="form-input"
                        placeholder="e.g. chinedu_o or Okeke Supplies"
                        value={usernameOrBusiness}
                        onChange={(e) => setUsernameOrBusiness(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-email">
                        Email Address *
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-phone">
                        Phone Number *
                      </label>
                      <input
                        id="reg-phone"
                        className="form-input"
                        placeholder="e.g. 0803 456 7890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-pass">
                        Password *
                      </label>
                      <input
                        id="reg-pass"
                        type="password"
                        className="form-input"
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-confirm">
                        Confirm Password *
                      </label>
                      <input
                        id="reg-confirm"
                        type="password"
                        className="form-input"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="ref-make-payment-btn"
                      disabled={submitting}
                    >
                      {submitting
                        ? "Sending Verification Email..."
                        : "Create Buyer Account"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="login-email">
                        Email Address *
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="login-pass">
                        Password *
                      </label>
                      <input
                        id="login-pass"
                        type="password"
                        className="form-input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="ref-make-payment-btn"
                      disabled={submitting}
                    >
                      {submitting ? "Signing In..." : "Sign In & Continue"}
                    </button>
                  </form>
                )}

                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.74rem",
                    color: "var(--muted)",
                    marginTop: "0.85rem",
                    marginBottom: 0,
                  }}
                >
                  <ShieldCheck size={13} color="var(--brand)" />
                  Email verification keeps your Kova Buyer account and receipts
                  secure.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function RegisterPage() {
  return (
    <>
      <KovaHeader />
      <Suspense
        fallback={
          <div style={{ padding: "2.5rem", textAlign: "center", fontSize: "0.84rem" }}>
            Loading...
          </div>
        }
      >
        <RegisterFormInner />
      </Suspense>
      <KovaFooter />
    </>
  );
}
