import React from "react";
import Link from "next/link";

export function KovaFooter() {
  return (
    <footer className="site-footer" id="about">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Link className="footer__logo" href="/" aria-label="Kova home">
              <img
                src="/brand/kova-logo-main.svg"
                alt="Kova"
                width={140}
                height={32}
                loading="lazy"
              />
            </Link>
            <p className="footer__positioning">
              Buy. Sell. Rent. List. Discover.
            </p>
            <p className="footer__desc">
              The student-focused marketplace and discovery platform for
              Nigerian universities and campus communities.
            </p>
            <div className="footer__contact">
              <a href="mailto:admin@kovadml.com">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                admin@kovadml.com
              </a>
            </div>
            <div className="footer__socials">
              <a
                href="https://www.facebook.com/people/Kova-dml/61575032373022/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kova on Facebook"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/kova_dml/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Kova on Instagram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer__col">
            <h2>Ecosystem</h2>
            <ul>
              <li>
                <a href="https://www.kovadml.com/#app">How it works</a>
              </li>
              <li>
                <a href="https://www.kovadml.com/#apartments">Apartments</a>
              </li>
              <li>
                <a href="https://www.kovadml.com/#marketplace">Marketplace</a>
              </li>
              <li>
                <a href="https://www.kovadml.com/#trust">Trust &amp; safety</a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h2>Company</h2>
            <ul>
              <li>
                <a href="https://www.kovadml.com/#about">About</a>
              </li>
              <li>
                <a href="https://www.kovadml.com/#merchants">
                  For agents &amp; vendors
                </a>
              </li>
              <li>
                <a href="https://www.kovadml.com/#faq">FAQ</a>
              </li>
              <li>
                <a href="mailto:admin@kovadml.com">Contact</a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h2>Legal &amp; policies</h2>
            <ul>
              <li>
                <a href="https://www.kovadml.com/privacy/">Privacy policy</a>
              </li>
              <li>
                <a href="https://www.kovadml.com/terms/">
                  Terms &amp; conditions
                </a>
              </li>
              <li>
                <a href="https://www.kovadml.com/account/delete/">
                  Delete account
                </a>
              </li>
              <li>
                <a href="https://www.kovadml.com/#trust">Safety guidelines</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            &copy; 2026 Kova Digital Market Limited. All rights reserved.
          </span>
          <span>Public Web Storefront &amp; Paystack Commerce</span>
        </div>
      </div>
    </footer>
  );
}
