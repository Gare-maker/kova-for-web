"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Lock,
  Minus,
  Plus,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  MapPin,
  Mail,
} from "lucide-react";
import type { Product, Vendor, Order, PaymentCategory } from "@/lib/types";
import { formatNaira } from "@/lib/format";

interface PaymentBottomSheetProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  vendor: Vendor;
  maxQuantity: number;
}

export function PaymentBottomSheet({
  open,
  onClose,
  product,
  vendor,
  maxQuantity,
}: PaymentBottomSheetProps) {
  const router = useRouter();
  const isProperty =
    product.category.toLowerCase().includes("propert") ||
    product.category.toLowerCase().includes("apartment");

  const [paymentMode, setPaymentMode] = useState<"product" | "property">(
    isProperty ? "property" : "product"
  );
  const [propertyFeeType, setPropertyFeeType] = useState<"inspection" | "agent">(
    "inspection"
  );
  const [quantity, setQuantity] = useState(1);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [step, setStep] = useState<"form" | "paystack" | "verifying">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [paymentChannel, setPaymentChannel] = useState<
    "Paystack (Card)" | "Paystack (Bank Transfer)"
  >("Paystack (Card)");

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "verifying" && !loading) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, step, loading, onClose]);

  useEffect(() => {
    setPaymentMode(isProperty ? "property" : "product");
    setPropertyFeeType("inspection");
    setQuantity(1);
    setStep("form");
    setError(null);
    setPendingOrder(null);
  }, [product.id, isProperty]);

  if (!open) return null;

  const safeMax = Math.max(1, maxQuantity);
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
  const totalPayable = activeUnitPrice * activeQty;

  const paymentLabel =
    paymentMode === "product"
      ? "Product Payment"
      : propertyFeeType === "inspection"
      ? "Property Inspection Fee"
      : "Property Agent Fee";

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !location.trim()
    ) {
      setError(
        "Please fill in your full name, email address, phone number, and location."
      );
      return;
    }

    if (paymentMode === "product" && !deliveryAddress.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: activeQty,
          paymentCategory,
          customer: {
            name: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            location: location.trim(),
            currentLocation: location.trim(),
            deliveryAddress: deliveryAddress.trim() || location.trim(),
            deliveryNotes: notes.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to start payment. Please try again.");
        return;
      }

      if (data.mode === "paystack_live" && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }

      setPendingOrder(data.order);
      setStep("paystack");
    } catch {
      setError("Network error while connecting to payment gateway. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
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

  return (
    <div
      className="kova-sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kova-payment-sheet-title"
      onClick={() => {
        if (step !== "verifying" && !loading) onClose();
      }}
    >
      <div className="kova-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="kova-sheet__handle" aria-hidden="true" />

        {/* Sheet Header */}
        <div className="kova-sheet__header">
          <div>
            <h2 id="kova-payment-sheet-title" className="kova-sheet__title">
              {step === "form"
                ? "Complete Payment"
                : step === "paystack"
                ? "Paystack Secure Payment"
                : "Confirming Payment"}
            </h2>
            <p className="kova-sheet__sub">
              {vendor.fullName} · {paymentLabel}
            </p>
          </div>

          {step !== "verifying" && (
            <button
              type="button"
              className="kova-sheet__close"
              onClick={onClose}
              disabled={loading}
              aria-label="Close payment sheet"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="kova-sheet__body">
          {/* Compact Item Summary Strip */}
          <div className="kova-sheet-item">
            <img
              src={product.images[0] || "/listings/smartphone.jpg"}
              alt={product.name}
              className="kova-sheet-item__img"
            />
            <div className="kova-sheet-item__info">
              <div className="kova-sheet-item__name">{product.name}</div>
              <div className="kova-sheet-item__meta">
                {formatNaira(activeUnitPrice)}
                {paymentMode === "product" ? ` × ${activeQty}` : ` · ${paymentLabel}`}
              </div>
            </div>
            <div className="kova-sheet-item__total">
              {formatNaira(totalPayable)}
            </div>
          </div>

          {error && (
            <div className="kova-sheet-error" role="alert">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {step === "form" && (
            <form id="kova-sheet-form" onSubmit={handleSubmitForm}>
              {/* Property Fee Selector OR Product Quantity Stepper */}
              {isProperty ? (
                <div className="kova-sheet-fee-row">
                  <button
                    type="button"
                    className={`kova-sheet-choice ${
                      paymentMode === "property" && propertyFeeType === "inspection"
                        ? "kova-sheet-choice--active"
                        : ""
                    }`}
                    onClick={() => {
                      setPaymentMode("property");
                      setPropertyFeeType("inspection");
                    }}
                  >
                    <span>Inspection Fee</span>
                    <strong>{formatNaira(inspectionAmount)}</strong>
                  </button>
                  <button
                    type="button"
                    className={`kova-sheet-choice ${
                      paymentMode === "property" && propertyFeeType === "agent"
                        ? "kova-sheet-choice--active"
                        : ""
                    }`}
                    onClick={() => {
                      setPaymentMode("property");
                      setPropertyFeeType("agent");
                    }}
                  >
                    <span>Agent Fee</span>
                    <strong>{formatNaira(agentAmount)}</strong>
                  </button>
                  <button
                    type="button"
                    className={`kova-sheet-choice ${
                      paymentMode === "product" ? "kova-sheet-choice--active" : ""
                    }`}
                    onClick={() => setPaymentMode("product")}
                  >
                    <span>Full Amount</span>
                    <strong>{formatNaira(product.price)}</strong>
                  </button>
                </div>
              ) : (
                <div className="kova-sheet-qty-row">
                  <div>
                    <div className="kova-sheet-qty-row__label">Quantity</div>
                    <div className="kova-sheet-qty-row__sub">
                      {safeMax} available
                    </div>
                  </div>
                  <div className="kova-sheet-qty-ctrl">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(safeMax, q + 1))}
                      disabled={quantity >= safeMax}
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="sheet-full-name">
                  Full Name *
                </label>
                <input
                  id="sheet-full-name"
                  className="form-input"
                  placeholder="e.g. Chinedu Okeke"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label className="form-label" htmlFor="sheet-email">
                    Email Address *
                  </label>
                  <input
                    id="sheet-email"
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
                  <label className="form-label" htmlFor="sheet-phone">
                    Phone Number *
                  </label>
                  <input
                    id="sheet-phone"
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 0803 456 7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sheet-location">
                  Location *
                </label>
                <div className="kova-input-icon-wrap">
                  <MapPin size={14} aria-hidden="true" />
                  <input
                    id="sheet-location"
                    className="form-input kova-input-with-icon"
                    placeholder="e.g. Lekki, Lagos State"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sheet-address">
                  {paymentMode === "product"
                    ? "Delivery Address *"
                    : "Street Address / Landmark (Optional)"}
                </label>
                <input
                  id="sheet-address"
                  className="form-input"
                  placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  autoComplete="street-address"
                  required={paymentMode === "product"}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "0.2rem" }}>
                <label className="form-label" htmlFor="sheet-notes">
                  Notes (Optional)
                </label>
                <input
                  id="sheet-notes"
                  className="form-input"
                  placeholder="e.g. Call me upon arrival or preferred colour/length"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="kova-sheet-email-note">
                <Mail size={13} aria-hidden="true" />
                <span>
                  No account needed. Your PDF receipt will be downloadable
                  immediately and emailed to you automatically.
                </span>
              </div>
            </form>
          )}

          {step === "paystack" && pendingOrder && (
            <div className="kova-sheet-paystack">
              <div className="kova-sheet-paystack__meta">
                <div>
                  <div className="kova-sheet-paystack__label">Amount to Pay</div>
                  <div className="kova-sheet-paystack__amount">
                    {formatNaira(pendingOrder.totalPaid)}
                  </div>
                </div>
                <span className="kova-sheet-paystack__ref">
                  Ref: {pendingOrder.transactionReference}
                </span>
              </div>

              <div className="kova-sheet-paystack__buyer">
                <strong>{pendingOrder.customer.name}</strong> ·{" "}
                {pendingOrder.customer.email} ·{" "}
                {pendingOrder.customer.currentLocation}
              </div>

              <p className="kova-sheet-paystack__prompt">
                Select your Paystack payment channel:
              </p>

              <div className="kova-sheet-channels">
                <button
                  type="button"
                  className={`kova-sheet-channel ${
                    paymentChannel === "Paystack (Card)"
                      ? "kova-sheet-channel--active"
                      : ""
                  }`}
                  onClick={() => setPaymentChannel("Paystack (Card)")}
                >
                  <CreditCard size={16} />
                  <span>Debit Card</span>
                </button>
                <button
                  type="button"
                  className={`kova-sheet-channel ${
                    paymentChannel === "Paystack (Bank Transfer)"
                      ? "kova-sheet-channel--active"
                      : ""
                  }`}
                  onClick={() => setPaymentChannel("Paystack (Bank Transfer)")}
                >
                  <Building2 size={16} />
                  <span>Bank Transfer</span>
                </button>
              </div>
            </div>
          )}

          {step === "verifying" && (
            <div className="kova-sheet-verifying">
              <div className="kova-sheet-verifying__icon">
                <ShieldCheck size={24} color="var(--brand)" />
              </div>
              <h3>Verifying your payment...</h3>
              <p>
                Confirming your transaction and generating your official PDF
                receipt.
              </p>
            </div>
          )}
        </div>

        {/* Sticky Bottom Sheet Footer CTA */}
        {step !== "verifying" && (
          <div className="kova-sheet__footer">
            {step === "form" ? (
              <button
                type="submit"
                form="kova-sheet-form"
                className="ref-make-payment-btn"
                style={{ marginTop: 0 }}
                disabled={loading}
              >
                <Lock size={14} />
                {loading
                  ? "Connecting to Paystack..."
                  : `Pay ${formatNaira(totalPayable)} Now`}
              </button>
            ) : (
              <div className="kova-sheet__footer-row">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => {
                    setStep("form");
                    setError(null);
                  }}
                  disabled={loading}
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  className="btn btn--brand"
                  style={{ flex: 1 }}
                  onClick={handleConfirmPayment}
                  disabled={loading}
                >
                  <CheckCircle2 size={15} />
                  {loading
                    ? "Verifying..."
                    : `Authorize & Pay ${formatNaira(
                        pendingOrder?.totalPaid ?? totalPayable
                      )}`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

