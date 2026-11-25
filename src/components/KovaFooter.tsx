import React from "react";
import Link from "next/link";
import { MapPin, Mail, ShieldCheck } from "lucide-react";
import type { Vendor } from "@/lib/types";

interface KovaFooterProps {
  vendor?: Pick<
    Vendor,
    "username" | "fullName" | "categoryBadge" | "bio" | "location" | "memberSince"
  > | null;
}

export function KovaFooter({ vendor }: KovaFooterProps = {}) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: About the Vendor / Showroom */}
          <div className="footer-col footer-col--about">
            <h2 className="footer-brand-name">
              {vendor ? vendor.fullName : "Kova Showroom"}
            </h2>
            {vendor?.categoryBadge && (
              <span className="footer-category-tag">
                {vendor.categoryBadge}
              </span>
            )}
            <p className="footer-about-text">
              {vendor
                ? vendor.bio
                : "Discover curated listings, transparent pricing, and verified Paystack checkout with instant digital receipts on Kova Showroom."}
            </p>
            {vendor?.location && (
              <div className="footer-meta-row">
                <MapPin size={13} aria-hidden="true" />
                <span>{vendor.location}</span>
              </div>
            )}
          </div>

          {/* Column 2: Navigation */}
          <div className="footer-col">
            <h3 className="footer-heading">Navigation</h3>
            <ul className="footer-link-list">
              <li>
                <Link href="/">Showroom</Link>
              </li>
              <li>
                <Link href="/account/receipts">My Receipts</Link>
              </li>
              <li>
                <Link href="/register">Buyer Account</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Support */}
          <div className="footer-col">
            <h3 className="footer-heading">Platform &amp; Enquiries</h3>
            <ul className="footer-link-list">
              <li className="footer-info-item">
                <ShieldCheck size={13} aria-hidden="true" />
                <span>Verified Paystack Checkout &amp; PDF Receipts</span>
              </li>
              <li>
                <a href="mailto:admin@kovadml.com" className="footer-info-link">
                  <Mail size={13} aria-hidden="true" />
                  <span>admin@kovadml.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.kovadml.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Kova Digital Market
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Subtle Platform Attribution */}
        <div className="footer-bottom">
          <div className="footer-powered" aria-label="Powered by Kova">
            <span>Powered by</span>
            <img
              src="/brand/kova-logo-main.svg"
              alt="Kova"
              width={42}
              height={11}
              loading="lazy"
            />
          </div>

          <p className="footer-copyright">
            &copy; Kova Digital Market Limited. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
