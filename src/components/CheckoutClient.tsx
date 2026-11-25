"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Minus,
  Plus,
} from "lucide-react";
import type { Product, Vendor, Order, PaymentCategory } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import { KovaHeader } from "./KovaHeader";
import { KovaFooter } from "./KovaFooter";

interface CheckoutClientProps {
  product: Product;
  vendor: Vendor;
  effectiveAvailable: boolean;
  effectiveRemaining: number;
  initialBuyer?: { name: string; phone: string; email: string } | null;
}

export function CheckoutClient({
  product,
  vendor,
  effectiveAvailable,
  effectiveRemaining,
  initialBuyer,
}: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyRef = searchParams.get("verify");

  const initialMode: "product" | "property" =
    searchParams.get("type") === "property" ? "property" : "product";
  const initialFee: "inspection" | "agent" =
    searchParams.get("feeType") === "agent" ? "agent" : "inspection";
  const initialQty = Math.min(
    Math.max(1, effectiveRemaining),
    Math.max(1, Number(searchParams.get("qty")) || 1)
  );

  const [paymentMode, setPaymentMode] = useState<"product" | "property">(
    initialMode
  );
  const [propertyFeeType, setPropertyFeeType] = useState<"inspection" | "agent">(
    initialFee
  );
  const [quantity, setQuantity] = useState(initialQty);

  const [name, setName] = useState(initialBuyer?.name ?? "");
  const [phone, setPhone] = useState(initialBuyer?.phone ?? "");
  const [email, setEmail] = useState(initialBuyer?.email ?? "");
  const [currentLocation, setCurrentLocation] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [step, setStep] = useState<"form" | "review" | "paystack" | "verifying">(
    verifyRef ? "verifying" : "form"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [paymentChannel, setPaymentChannel] = useState<
    "Paystack (Card)" | "Paystack (Bank Transfer)"
  >("Paystack (Card)");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    router.prefetch(`/product/${product.id}`);
  }, [router, product.id]);

  useEffect(() => {
    if (!verifyRef) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: verifyRef }),
        });
        const data = await res.json();
        if (!active) return;
        if (res.ok && data.receiptUrl) {
          router.replace(data.receiptUrl);
        } else {
          setError(
            data.error ||
              "Your payment could not be completed. Please try again."
          );
          setStep("form");
        }
      } catch {
        if (active) {
          setError("We're confirming your payment. Please check back shortly.");
          setStep("form");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [verifyRef, router]);

  const inspectionAmount =
    product.inspectionFee && product.inspectionFee > 0
      ? product.inspectionFee
      : 10000;
  const agentAmount =
    product.agentFee && product.agentFee > 0 ? product.agentFee : 17000;

  const paymentCategory: PaymentCategory =
    paymentMode === "product"
      ? "product"
      : propertyFeeType === "inspection"
      ? "property_inspection"
      : "property_agent";

  const activeUnitPrice =
    paymentMode === "product"
      ? product.price
      : propertyFeeType === "inspection"
      ? inspectionAmount
      : agentAmount;

  const activeQty = paymentMode === "product" ? quantity : 1;
  const subtotal = activeUnitPrice * activeQty;
  const totalPayable = subtotal;

  const paymentLabel =
    paymentMode === "product"
      ? "Product Payment"
      : propertyFeeType === "inspection"
      ? "Property Inspection Fee"
      : "Property Agent Fee";

  const handleContinueToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !currentLocation.trim() ||
      !deliveryAddress.trim()
    ) {
      setError(
        "Please fill in your full name, phone number, email, current location, and delivery address."
      );
      return;
    }
    setStep("review");
  };

  const handleInitializePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: activeQty,
          paymentCategory,
          customer: {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            currentLocation: currentLocation.trim(),
            deliveryAddress: deliveryAddress.trim(),
            deliveryNotes: deliveryNotes.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(
          `/register?next=${encodeURIComponent(`/checkout/${product.id}`)}`
        );
        return;
      }
      if (!res.ok) {
        setError(data.error || "Unable to initialize payment.");
        return;
      }

      if (data.mode === "paystack_live" && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }

      setPendingOrder(data.order);
      setStep("paystack");
    } catch {
      setError("Network error while initializing payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSimulatorPayment = async () => {
    if (!pendingOrder) return;
    setLoading(true);
    setError(null);
    setStep("verifying");
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: pendingOrder.transactionReference,
          paymentMethod: paymentChannel,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.receiptUrl) {
        setError(
          data.error || "Your payment could not be completed. Please try again."
        );
        setStep("paystack");
        return;
      }
      router.push(data.receiptUrl);
    } catch {
      setError("Your payment could not be completed. Please try again.");
      setStep("paystack");
    } finally {
      setLoading(false);
    }
  };

  const safeMax = Math.max(1, effectiveRemaining);

  const handleBack = () => {
    if (step === "paystack") {
      setStep("review");
      return;
    }
    if (step === "review") {
      setStep("form");
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin
    ) {
      router.back();
      return;
    }
    router.push(`/product/${product.id}`);
  };

  return (
    <>
      <KovaHeader />

      <main id="main" className="storefront-main">
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "0.2rem",
            }}
          >
            <h1
              className="display display--md"
              style={{ color: "var(--ink-strong)" }}
            >
              Make Payment
            </h1>
            <button
              type="button"
              onClick={handleBack}
              className="btn btn--ghost btn--sm"
            >
              <ArrowLeft size={14} />
              {step === "form" ? "Back to Product" : "Back"}
            </button>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: 0, marginBottom: "1rem" }}>
            {paymentLabel} · Sold by <strong>{vendor.fullName}</strong>
          </p>

          {!effectiveAvailable && paymentMode === "product" && step === "form" ? (
            <div className="empty-state">
              <AlertCircle
                size={32}
                color="var(--danger)"
                style={{ marginInline: "auto" }}
              />
              <h3>Sorry, this product is currently unavailable.</h3>
              <p>It may have just been purchased or reserved by another buyer.</p>
              <Link href="/" className="btn btn--brand btn--sm">
                Browse Other Products
              </Link>
            </div>
          ) : (
            <div className="checkout-grid">
              <div className="surface-card">
                {error && (
                  <div
                    style={{
                      background: "var(--danger-soft)",
                      color: "var(--danger)",
                      padding: "0.6rem 0.75rem",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      marginBottom: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                {step === "form" && (
                  <form onSubmit={handleContinueToReview}>
                    <h2
                      className="display display--sm"
                      style={{ marginBottom: "1rem" }}
                    >
                      1. Payment Type &amp; Delivery Information
                    </h2>

                    {/* Switchable Payment Type */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.55rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setPaymentMode("product")}
                        className="btn btn--outline btn--sm"
                        style={{
                          borderColor:
                            paymentMode === "product" ? "var(--brand)" : undefined,
                          background:
                            paymentMode === "product"
                              ? "var(--brand-soft)"
                              : undefined,
                          color:
                            paymentMode === "product"
                              ? "var(--forest)"
                              : undefined,
                        }}
                      >
                        Product Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode("property")}
                        className="btn btn--outline btn--sm"
                        style={{
                          borderColor:
                            paymentMode === "property" ? "var(--brand)" : undefined,
                          background:
                            paymentMode === "property"
                              ? "var(--brand-soft)"
                              : undefined,
                          color:
                            paymentMode === "property"
                              ? "var(--forest)"
                              : undefined,
                        }}
                      >
                        Property Payment
                      </button>
                    </div>

                    {paymentMode === "product" ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "var(--paper-subtle)",
                          border: "1px solid var(--line)",
                          borderRadius: 10,
                          padding: "0.75rem 0.9rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                            Quantity
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                            {formatNaira(product.price)} &times; {quantity} ={" "}
                            {formatNaira(subtotal)}
                          </div>
                        </div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.55rem" }}>
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            aria-label="Decrease quantity"
                            className="btn btn--outline btn--sm"
                            style={{ padding: "0.35rem 0.5rem", minHeight: 32 }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ minWidth: 22, textAlign: "center", fontWeight: 600 }}>
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity((q) => Math.min(safeMax, q + 1))
                            }
                            disabled={quantity >= safeMax}
                            aria-label="Increase quantity"
                            className="btn btn--outline btn--sm"
                            style={{ padding: "0.35rem 0.5rem", minHeight: 32 }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.55rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setPropertyFeeType("inspection")}
                          className="btn btn--outline btn--sm"
                          style={{
                            borderColor:
                              propertyFeeType === "inspection"
                                ? "var(--brand)"
                                : undefined,
                            background:
                              propertyFeeType === "inspection"
                                ? "var(--brand-soft)"
                                : undefined,
                          }}
                        >
                          Inspection ({formatNaira(inspectionAmount)})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPropertyFeeType("agent")}
                          className="btn btn--outline btn--sm"
                          style={{
                            borderColor:
                              propertyFeeType === "agent"
                                ? "var(--brand)"
                                : undefined,
                            background:
                              propertyFeeType === "agent"
                                ? "var(--brand-soft)"
                                : undefined,
                          }}
                        >
                          Agent Fee ({formatNaira(agentAmount)})
                        </button>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-name">
                        Full Name *
                      </label>
                      <input
                        id="cust-name"
                        className="form-input"
                        placeholder="e.g. Chinedu Okeke"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-phone">
                        Phone Number *
                      </label>
                      <input
                        id="cust-phone"
                        className="form-input"
                        placeholder="e.g. 0803 456 7890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-email">
                        Email Address *
                      </label>
                      <input
                        id="cust-email"
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-current-loc">
                        Current Location *
                      </label>
                      <input
                        id="cust-current-loc"
                        className="form-input"
                        placeholder="e.g. Ikeja, Lagos State"
                        value={currentLocation}
                        onChange={(e) => setCurrentLocation(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-address">
                        Delivery Location / Address *
                      </label>
                      <input
                        id="cust-address"
                        className="form-input"
                        placeholder="e.g. Block C, Room 14, Sabo, Auchi"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-notes">
                        Delivery Notes (Optional)
                      </label>
                      <input
                        id="cust-notes"
                        className="form-input"
                        placeholder="e.g. Call me upon arrival"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn--brand"
                      style={{ width: "100%", marginTop: "0.5rem" }}
                    >
                      Review Order &amp; Continue
                    </button>
                  </form>
                )}

                {step === "review" && (
                  <div>
                    <h2
                      className="display display--sm"
                      style={{ marginBottom: "1rem" }}
                    >
                      2. Review Information &amp; Pay
                    </h2>

                    <div
                      style={{
                        background: "var(--paper-subtle)",
                        border: "1px solid var(--line)",
                        borderRadius: 10,
                        padding: "0.8rem",
                        marginBottom: "0.95rem",
                        fontSize: "0.8rem",
                        display: "grid",
                        gap: "0.3rem",
                      }}
                    >
                      <div>
                        <strong>Payment Type:</strong> {paymentLabel}
                      </div>
                      <div>
                        <strong>Full Name:</strong> {name}
                      </div>
                      <div>
                        <strong>Phone Number:</strong> {phone}
                      </div>
                      <div>
                        <strong>Email:</strong> {email}
                      </div>
                      <div>
                        <strong>Current Location:</strong> {currentLocation}
                      </div>
                      <div>
                        <strong>Delivery Address:</strong> {deliveryAddress}
                      </div>
                      {deliveryNotes && (
                        <div>
                          <strong>Notes:</strong> {deliveryNotes}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn--outline"
                        onClick={() => setStep("form")}
                        disabled={loading}
                      >
                        Edit Information
                      </button>
                      <button
                        type="button"
                        className="btn btn--brand"
                        style={{ flex: 1 }}
                        onClick={handleInitializePayment}
                        disabled={loading}
                      >
                        <Lock size={15} />
                        {loading
                          ? "Initializing Paystack..."
                          : `Pay ${formatNaira(totalPayable)} with Paystack`}
                      </button>
                    </div>
                  </div>
                )}

                {step === "paystack" && pendingOrder && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingBottom: "0.9rem",
                        borderBottom: "1px solid var(--line)",
                        marginBottom: "1.1rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "var(--muted)",
                            fontWeight: 600,
                          }}
                        >
                          Paystack Secure Checkout
                        </div>
                        <div
                          className="display display--sm"
                          style={{ color: "var(--brand-dark)" }}
                        >
                          {formatNaira(pendingOrder.totalPaid)}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          background: "var(--brand-soft)",
                          color: "var(--forest)",
                          padding: "0.3rem 0.65rem",
                          borderRadius: 999,
                          fontWeight: 600,
                        }}
                      >
                        Ref: {pendingOrder.transactionReference}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "0.86rem",
                        color: "var(--muted)",
                        marginTop: 0,
                      }}
                    >
                      Select a payment channel to complete your verified
                      Paystack transaction:
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.75rem",
                        marginBottom: "1.25rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setPaymentChannel("Paystack (Card)")}
                        className="btn btn--outline"
                        style={{
                          borderColor:
                            paymentChannel === "Paystack (Card)"
                              ? "var(--brand)"
                              : undefined,
                          background:
                            paymentChannel === "Paystack (Card)"
                              ? "var(--brand-soft)"
                              : undefined,
                        }}
                      >
                        <CreditCard size={16} />
                        Debit Card
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPaymentChannel("Paystack (Bank Transfer)")
                        }
                        className="btn btn--outline"
                        style={{
                          borderColor:
                            paymentChannel === "Paystack (Bank Transfer)"
                              ? "var(--brand)"
                              : undefined,
                          background:
                            paymentChannel === "Paystack (Bank Transfer)"
                              ? "var(--brand-soft)"
                              : undefined,
                        }}
                      >
                        <Building2 size={16} />
                        Bank Transfer
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn--brand"
                      style={{ width: "100%" }}
                      onClick={handleConfirmSimulatorPayment}
                      disabled={loading}
                    >
                      <CheckCircle2 size={16} />
                      {loading
                        ? "Verifying with Paystack..."
                        : `Authorize & Pay ${formatNaira(pendingOrder.totalPaid)}`}
                    </button>
                  </div>
                )}

                {step === "verifying" && (
                  <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                    <h2 className="display display--sm">
                      Confirming your payment...
                    </h2>
                    <p style={{ color: "var(--muted)" }}>
                      We&apos;re verifying your transaction with Paystack and
                      generating your receipt.
                    </p>
                  </div>
                )}
              </div>

              <aside className="surface-card">
                <h2
                  className="display display--sm"
                  style={{ marginBottom: "1rem" }}
                >
                  Order Summary
                </h2>

                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                    paddingBottom: "0.8rem",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <img
                    src={product.images[0] || "/listings/smartphone.jpg"}
                    alt={product.name}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 9,
                      objectFit: "cover",
                      background: "var(--paper-deep)",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.84rem",
                        color: "var(--ink-strong)",
                        lineHeight: 1.3,
                      }}
                    >
                      {product.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.74rem",
                        color: "var(--brand-dark)",
                        fontWeight: 600,
                      }}
                    >
                      {paymentLabel}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      Sold by {vendor.fullName} (@{vendor.username})
                    </div>
                    {paymentMode === "product" && (
                      <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                        Qty: {activeQty}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.45rem",
                    paddingBlock: "0.8rem",
                    borderBottom: "1px solid var(--line)",
                    fontSize: "0.82rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "var(--muted)" }}>
                      {paymentMode === "product"
                        ? `Product Price (${activeQty}x)`
                        : paymentLabel}
                    </span>
                    <strong>{formatNaira(subtotal)}</strong>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "0.8rem",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.86rem" }}>
                    Total Payable
                  </span>
                  <span
                    className="display display--sm"
                    style={{ color: "var(--brand-dark)" }}
                  >
                    {formatNaira(totalPayable)}
                  </span>
                </div>

                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.74rem",
                    color: "var(--muted)",
                    marginTop: "0.85rem",
                    marginBottom: 0,
                  }}
                >
                  <ShieldCheck size={14} color="var(--brand)" />
                  Server-verified Paystack payment with instant PDF receipt.
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>

      <KovaFooter vendor={vendor} />
    </>
  );
}
