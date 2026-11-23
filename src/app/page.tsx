import Link from "next/link";
import { ArrowUpRight, MapPin, Package, ShieldCheck } from "lucide-react";
import { getAllEligibleVendors, getVendorProducts } from "@/lib/db";
import { getInitials } from "@/lib/format";
import { KovaHeader } from "@/components/KovaHeader";
import { KovaFooter } from "@/components/KovaFooter";
import { VerificationBadge } from "@/components/VerificationBadge";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const vendors = getAllEligibleVendors();

  return (
    <>
      <KovaHeader />

      <main id="main" className="storefront-main">
        <div className="container">
          <section
            style={{
              background: "var(--forest)",
              color: "var(--paper)",
              borderRadius: 18,
              padding: "clamp(1.75rem, 4vw, 3.25rem)",
              boxShadow: "var(--shadow-soft)",
              marginBottom: "2rem",
            }}
          >
            <p
              style={{
                color: "var(--brand-light)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontSize: "0.72rem",
                fontWeight: 800,
                margin: "0 0 0.65rem",
              }}
            >
              Kova Public Web Storefronts
            </p>
            <h1
              className="display display--lg"
              style={{ color: "#fff", maxWidth: "18ch" }}
            >
              Shop verified Kova vendors directly from your browser.
            </h1>
            <p
              style={{
                color: "rgba(247, 248, 249, 0.8)",
                maxWidth: "56ch",
                marginTop: "0.9rem",
                marginBottom: "1.5rem",
                fontSize: "1.02rem",
              }}
            >
              Browse storefronts, message sellers in real time, pay securely with
              Paystack, and download official PDF receipts — no app installation
              required.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <Link href="/store/Freddy" className="btn btn--brand">
                Visit @Freddy Storefront
                <ArrowUpRight size={16} />
              </Link>
              <Link
                href="/vendor-console"
                className="btn btn--outline"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.22)",
                }}
              >
                Open Vendor Sync Console
              </Link>
            </div>
          </section>

          <section aria-labelledby="vendors-heading">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <h2 id="vendors-heading" className="display display--sm">
                  Featured Vendor Storefronts
                </h2>
                <p style={{ margin: "0.2rem 0 0", color: "var(--muted)" }}>
                  Every vendor has a shareable URL at{" "}
                  <code>/store/username</code>.
                </p>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.82rem",
                  color: "var(--forest)",
                  background: "var(--brand-soft)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: 999,
                  fontWeight: 700,
                }}
              >
                <ShieldCheck size={15} />
                4.9% Kova Commission · Paystack Verified
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {vendors.map((vendor) => {
                const count = getVendorProducts(vendor.id).length;
                return (
                  <article
                    key={vendor.id}
                    className="surface-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.9rem",
                      }}
                    >
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: "var(--forest)",
                          color: "#fff",
                          display: "grid",
                          placeItems: "center",
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: "1.2rem",
                          flex: "none",
                        }}
                      >
                        {vendor.avatarUrl ? (
                          <img
                            src={vendor.avatarUrl}
                            alt={vendor.fullName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          getInitials(vendor.fullName)
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3
                          className="display"
                          style={{ fontSize: "1.15rem", color: "var(--ink-strong)" }}
                        >
                          {vendor.fullName}
                        </h3>
                        <div
                          style={{
                            fontSize: "0.86rem",
                            color: "var(--muted)",
                            fontWeight: 600,
                          }}
                        >
                          @{vendor.username} · {vendor.role}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.45rem",
                      }}
                    >
                      <VerificationBadge status={vendor.verificationStatus} />
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.3rem 0.65rem",
                          borderRadius: 999,
                          background: "var(--paper-deep)",
                          color: "var(--ink-soft)",
                        }}
                      >
                        <MapPin size={12} />
                        {vendor.location}
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.3rem 0.65rem",
                          borderRadius: 999,
                          background: "var(--paper-deep)",
                          color: "var(--ink-soft)",
                        }}
                      >
                        <Package size={12} />
                        {count} listings
                      </span>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        color: "var(--ink-soft)",
                        flex: 1,
                      }}
                    >
                      {vendor.bio}
                    </p>

                    <Link
                      href={`/store/${vendor.username}`}
                      className="btn btn--brand btn--sm"
                    >
                      Open Storefront
                      <ArrowUpRight size={15} />
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>

          <AppDownloadBanner />
        </div>
      </main>

      <KovaFooter />
    </>
  );
}

