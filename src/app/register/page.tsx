"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertCircle, UserCheck } from "lucide-react";
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to register your Buyer account.");
        return;
      }

      setSuccessMsg(
        data.message ||
          `Buyer account created! A confirmation email has been sent to ${email.trim()}.`
      );
      setTimeout(() => {
        router.replace(nextUrl);
        router.refresh();
      }, 1100);
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

  return (
    <main id="main" className="storefront-main">
      <div className="container" style={{ maxWidth: 540 }}>
        <div className="surface-card">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              background: "var(--brand-soft)",
              color: "var(--forest)",
              padding: "0.32rem 0.72rem",
              borderRadius: 999,
              fontSize: "0.78rem",
              fontWeight: 600,
              marginBottom: "0.85rem",
            }}
          >
            <UserCheck size={14} />
            Account Category: Buyer (Auto-assigned)
          </div>

          <h1
            className="display display--md"
            style={{ color: "var(--ink-strong)", marginBottom: "0.3rem" }}
          >
            {mode === "register"
              ? "Buyer Registration"
              : "Sign In to Your Buyer Account"}
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.9rem",
              margin: "0 0 1.25rem",
            }}
          >
            {mode === "register"
              ? "Create your Kova Buyer account to complete payments and save your receipts permanently."
              : "Sign in to continue to your payment and access your receipt history."}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
              marginBottom: "1.2rem",
              background: "var(--paper-subtle)",
              padding: "0.28rem",
              borderRadius: 10,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              style={{
                padding: "0.55rem",
                borderRadius: 8,
                border: "none",
                background: mode === "register" ? "#ffffff" : "transparent",
                color:
                  mode === "register" ? "var(--ink-strong)" : "var(--muted)",
                fontWeight: 600,
                fontSize: "0.88rem",
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
                padding: "0.55rem",
                borderRadius: 8,
                border: "none",
                background: mode === "login" ? "#ffffff" : "transparent",
                color: mode === "login" ? "var(--ink-strong)" : "var(--muted)",
                fontWeight: 600,
                fontSize: "0.88rem",
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
                padding: "0.75rem 0.9rem",
                borderRadius: 9,
                fontSize: "0.86rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {successMsg ? (
            <div
              style={{
                background: "var(--brand-soft)",
                color: "var(--forest)",
                padding: "1.25rem",
                borderRadius: 12,
                textAlign: "center",
              }}
            >
              <CheckCircle2
                size={32}
                color="var(--brand)"
                style={{ margin: "0 auto 0.5rem" }}
              />
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                {successMsg}
              </div>
              <div style={{ fontSize: "0.84rem" }}>
                Redirecting you to payment...
              </div>
            </div>
          ) : mode === "register" ? (
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
                  ? "Creating Buyer Account..."
                  : "Create Buyer Account & Continue"}
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
              gap: "0.4rem",
              fontSize: "0.78rem",
              color: "var(--muted)",
              marginTop: "1rem",
              marginBottom: 0,
            }}
          >
            <ShieldCheck size={14} color="var(--brand)" />
            Your Buyer account keeps all your Kova payment receipts securely
            stored.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <>
      <KovaHeader />
      <Suspense
        fallback={
          <div style={{ padding: "3rem", textAlign: "center" }}>Loading...</div>
        }
      >
        <RegisterFormInner />
      </Suspense>
      <KovaFooter />
    </>
  );
}

