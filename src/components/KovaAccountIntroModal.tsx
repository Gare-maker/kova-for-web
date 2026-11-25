"use client";

import React, { useEffect } from "react";
import { CheckCircle2, KeyRound, Search, ShoppingBag, Home, User, ReceiptText } from "lucide-react";

interface KovaAccountIntroModalProps {
  open: boolean;
  onContinue: () => void;
  onCancel: () => void;
}

export function KovaAccountIntroModal({
  open,
  onContinue,
  onCancel,
}: KovaAccountIntroModalProps) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onContinue();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onContinue]);

  if (!open) return null;

  return (
    <div
      className="kova-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kova-intro-modal-title"
      aria-describedby="kova-intro-modal-desc"
    >
      <div className="kova-intro-modal">
        {/* Prominent Kova Logo Header */}
        <div className="kova-intro-modal__header">
          <div className="kova-intro-modal__logo-wrap">
            <img
              src="/brand/kova-logo-main.svg"
              alt="Kova"
              className="kova-intro-modal__logo"
              width={96}
              height={24}
            />
          </div>
          <span className="kova-intro-modal__badge">
            <KeyRound size={11} aria-hidden="true" />
            One Unified Kova Login
          </span>
        </div>

        {/* Visual Mockup of the Kova Mobile Application */}
        <div className="kova-phone-stage" aria-hidden="true">
          <div className="kova-phone-mockup">
            <div className="kova-phone-notch" />

            {/* App Top Bar */}
            <div className="kova-phone-appbar">
              <img
                src="/brand/kova-logo-main.svg"
                alt=""
                className="kova-phone-appbar__logo"
                width={46}
                height={12}
              />
              <span className="kova-phone-appbar__pill">Kova App</span>
            </div>

            {/* App Search Bar */}
            <div className="kova-phone-search">
              <Search size={10} color="#6e6981" />
              <span>Explore vendors, products &amp; properties</span>
            </div>

            {/* App Mini Listings Grid */}
            <div className="kova-phone-grid">
              <div className="kova-phone-card">
                <img
                  src="/demo/ladies-wristwatch.jpg"
                  alt=""
                  loading="eager"
                />
                <div className="kova-phone-card__meta">
                  <span className="kova-phone-card__title">Luxury Watch</span>
                  <span className="kova-phone-card__price">₦48,000</span>
                </div>
              </div>
              <div className="kova-phone-card">
                <img
                  src="/brand/kova-app-preview.jpg"
                  alt=""
                  loading="eager"
                />
                <div className="kova-phone-card__meta">
                  <span className="kova-phone-card__title">Lekki 2-Bed Flat</span>
                  <span className="kova-phone-card__price">₦1.2M / yr</span>
                </div>
              </div>
            </div>

            {/* App Bottom Navigation */}
            <div className="kova-phone-tabbar">
              <span className="kova-phone-tab kova-phone-tab--active">
                <Home size={10} />
                <span>Explore</span>
              </span>
              <span className="kova-phone-tab">
                <ShoppingBag size={10} />
                <span>Market</span>
              </span>
              <span className="kova-phone-tab">
                <ReceiptText size={10} />
                <span>Receipts</span>
              </span>
              <span className="kova-phone-tab">
                <User size={10} />
                <span>Account</span>
              </span>
            </div>
          </div>
        </div>

        {/* Copy & Key Highlights */}
        <div className="kova-intro-modal__body">
          <h2 id="kova-intro-modal-title" className="kova-intro-modal__title">
            Your Kova Account, More Possibilities
          </h2>
          <p id="kova-intro-modal-desc" className="kova-intro-modal__desc">
            The account you are about to create can also be used to log in to
            the main Kova application. With the same login details, you can
            access the Kova app, explore products and properties listed by other
            users, and make purchases from other creators and vendors on Kova.
          </p>

          <ul className="kova-intro-modal__points">
            <li>
              <CheckCircle2 size={14} aria-hidden="true" />
              <span>
                <strong>Same email &amp; password</strong> works for this
                storefront and the main Kova app.
              </span>
            </li>
            <li>
              <CheckCircle2 size={14} aria-hidden="true" />
              <span>
                <strong>No separate account required</strong> to browse and shop
                across the wider Kova marketplace.
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="kova-intro-modal__actions">
          <button
            type="button"
            className="btn btn--outline kova-intro-modal__btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--brand kova-intro-modal__btn"
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

