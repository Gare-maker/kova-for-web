"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  MailCheck,
  AlertCircle,
  UserCheck,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Info,
} from "lucide-react";
import { KovaHeader } from "@/components/KovaHeader";
import { KovaFooter } from "@/components/KovaFooter";
import { KovaAccountIntroModal } from "@/components/KovaAccountIntroModal";
import { KovaPromoCard } from "@/components/KovaPromoCard";

export default function RegisterPage() {
  const router = useRouter();
  const [nextUrl, setNextUrl] = useState("/");

  const [mode, setMode] = useState<"register" | "login">("register");
  const [introModalOpen, setIntroModalOpen] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerifyEmail, setNeedsVerifyEmail] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  const [verifyPreviewUrl, setVerifyPreviewUrl] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/";
    setNextUrl(next);
    if (params.get("mode") === "login") {
      setMode("login");
      setIntroModalOpen(false);
    }
    const cleanNext = next.replace(/\?pay=1$/, "");
    router.prefetch(cleanNext.startsWith("/product/") ? cleanNext : "/");
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter both your First Name and Last Name.");
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
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirmPassword,
          next: nextUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to register your account.");
        return;
      }

      setRegisteredSuccess(true);
      setNeedsVerifyEmail(email.trim());
      setVerifyNotice(
        data.message ||
          `We sent a verification email to ${email.trim()}. Click the verification link to activate your Kova account.`
      );
      setVerifyPreviewUrl(data.verificationPreviewUrl ?? null);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
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
        setRegisteredSuccess(false);
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
    setError(null);
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

  const showTwoColumn = mode === "register" && !needsVerifyEmail;

  return (
    <>
      <KovaHeader />

      {/* Dismissible Entry Pop-up Explaining Kova Account Benefits */}
      <KovaAccountIntroModal
        open={introModalOpen && mode === "register" && !needsVerifyEmail}
        onContinue={() => setIntroModalOpen(false)}
        onCancel={() => {
          setIntroModalOpen(false);
          handleBack();
        }}
      />

      <main id="main" className="storefront-main">
        <div
          className="container"
          style={{
            maxWidth: showTwoColumn ? 900 : needsVerifyEmail ? 560 : 440,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.7rem",
              gap: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={handleBack}
              className="btn btn--ghost btn--sm"
              style={{ paddingLeft: 0 }}
            >
              <ArrowLeft size={14} />
              Back
            </button>

            {mode === "register" && !needsVerifyEmail && (
              <button
                type="button"
                className="kova-info-trigger"
                onClick={() => setIntroModalOpen(true)}
              >
                <Info size={13} aria-hidden="true" />
                <span>How Kova Account Works</span>
              </button>
            )}
          </div>

          {needsVerifyEmail ? (
            <div className="auth-card kova-success-card">
              <div className="kova-success-header">
                <div className="kova-success-icon">
                  {registeredSuccess ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <MailCheck size={22} />
                  )}
                </div>

                <div className="kova-success-powered">
                  <img
                    src="/brand/kova-logo-main.svg"
                    alt="Kova"
                    width={58}
                    height={15}
                  />
                  <span>Powered by Kova</span>
                </div>

                <h1 className="auth-card__title">
                  {registeredSuccess
                    ? "Your account has been created successfully!"
                    : "Verify Your Email"}
                </h1>

                <p className="kova-success-lead">
                  <strong>Your account is powered by Kova.</strong> You can now
                  use the same email address and password to log in to the Kova
                  app, discover more vendors, explore products, and shop across
                  the platform.
                </p>

                <div className="kova-safety-callout">
                  <KeyRound size={15} aria-hidden="true" />
                  <span>
                    <strong>
                      Keep your login details safe. You will need them to access
                      Kova.
                    </strong>
                  </span>
                </div>
              </div>

              {/* Verification Status & Direct Action */}
              <div className="kova-verify-box">
                <p className="kova-verify-box__msg">{verifyNotice}</p>

                {error && (
                  <div className="kova-error-banner" style={{ marginBottom: "0.65rem" }}>
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                {verifyPreviewUrl && (
                  <div style={{ marginBottom: "0.75rem" }}>
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
                      setRegisteredSuccess(false);
                      setMode("login");
                    }}
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>

              {/* Subtle Kova App Preview & Download Action */}
              <KovaPromoCard variant="success" />
            </div>
          ) : (
            <div className={showTwoColumn ? "register-grid" : undefined}>
              <div className="auth-card">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.32rem",
                    background: "var(--brand-soft)",
                    color: "var(--forest)",
                    padding: "0.2rem 0.54rem",
                    borderRadius: 999,
                    fontSize: "0.69rem",
                    fontWeight: 600,
                    marginBottom: "0.6rem",
                  }}
                >
                  <UserCheck size={12} />
                  Kova Account
                </div>

                <h1 className="auth-card__title">
                  {mode === "register" ? "Create Your Account" : "Sign In"}
                </h1>
                <p className="auth-card__desc">
                  {mode === "register"
                    ? "Register once to shop here and access the main Kova app."
                    : "Sign in with your Kova email and password to access payments and saved receipts."}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.3rem",
                    marginBottom: "0.85rem",
                    background: "var(--paper-subtle)",
                    padding: "0.2rem",
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
                      padding: "0.4rem",
                      borderRadius: 6,
                      border: "none",
                      background: mode === "register" ? "#ffffff" : "transparent",
                      color:
                        mode === "register"
                          ? "var(--ink-strong)"
                          : "var(--muted)",
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    style={{
                      padding: "0.4rem",
                      borderRadius: 6,
                      border: "none",
                      background: mode === "login" ? "#ffffff" : "transparent",
                      color:
                        mode === "login" ? "var(--ink-strong)" : "var(--muted)",
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    Sign In
                  </button>
                </div>

                {error && (
                  <div className="kova-error-banner">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                {mode === "register" ? (
                  <form onSubmit={handleRegister}>
                    <div className="form-row-two">
                      <div className="form-group">
                        <label className="form-label" htmlFor="reg-first-name">
                          First Name *
                        </label>
                        <input
                          id="reg-first-name"
                          className="form-input"
                          placeholder="e.g. Chinedu"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          autoComplete="given-name"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="reg-last-name">
                          Last Name *
                        </label>
                        <input
                          id="reg-last-name"
                          className="form-input"
                          placeholder="e.g. Okeke"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          autoComplete="family-name"
                          required
                        />
                      </div>
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
                        autoComplete="email"
                        required
                      />
                      <span className="kova-field-hint">
                        Powered by Kova — use this same email and password on
                        the Kova mobile app.
                      </span>
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
                        autoComplete="tel"
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
                        autoComplete="new-password"
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
                        autoComplete="new-password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="ref-make-payment-btn"
                      style={{ marginTop: "0.75rem" }}
                      disabled={submitting}
                    >
                      {submitting
                        ? "Creating Your Kova Account..."
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
                        autoComplete="email"
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
                        autoComplete="current-password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="ref-make-payment-btn"
                      style={{ marginTop: "0.75rem" }}
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
                    fontSize: "0.72rem",
                    color: "var(--muted)",
                    marginTop: "0.8rem",
                    marginBottom: 0,
                  }}
                >
                  <ShieldCheck size={13} color="var(--brand)" />
                  Email verification secures your Kova account and saved
                  receipts.
                </p>
              </div>

              {/* Kova Account Awareness + Click-to-Play App Preview Card */}
              {showTwoColumn && (
                <KovaPromoCard
                  variant="register"
                  emailEntered={Boolean(email.trim())}
                />
              )}
            </div>
          )}
        </div>
      </main>
      <KovaFooter />
    </>
  );
}
