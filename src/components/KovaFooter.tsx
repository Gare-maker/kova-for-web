import React from "react";
import { Mail, ShieldCheck } from "lucide-react";
import type { Vendor } from "@/lib/types";

interface KovaFooterProps {
  vendor?: Pick<
    Vendor,
    "username" | "fullName" | "categoryBadge" | "bio" | "role"
  > | null;
}

export function KovaFooter({ vendor }: KovaFooterProps = {}) {
  const businessName = vendor?.fullName?.trim() || "Zara Blue";
  const businessCategory =
    vendor?.categoryBadge?.trim() || vendor?.role?.trim() || null;
  const businessDescription = vendor?.bio?.trim() || null;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid footer-grid--minimal">
          {/* Column 1: Business Information */}
          <div className="footer-col footer-col--about">
            <h2 className="footer-brand-name">{businessName}</h2>
            {businessCategory && (
              <p className="footer-category-sub">{businessCategory}</p>
            )}
            {businessDescription && (
              <p className="footer-about-text">{businessDescription}</p>
            )}
          </div>

          {/* Column 2: Payments & Support */}
          <div className="footer-col">
            <h3 className="footer-heading">Payments &amp; Support</h3>
            <ul className="footer-link-list">
              <li className="footer-info-item">
                <ShieldCheck size={13} aria-hidden="true" />
                <span>Verified Paystack Payments &amp; Instant PDF Receipts</span>
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
                  Kova Digital Market
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Subtle Powered by Kova */}
        <div className="footer-bottom">
          <div className="footer-powered" aria-label="Powered by Kova">
            <span>Powered by</span>
            <img
              src="/brand/kova-logo-main.svg"
              alt="Kova"
              width={38}
              height={9}
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
