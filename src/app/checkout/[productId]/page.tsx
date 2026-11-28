import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  getProductWithVendor,
  readDb,
  getEffectiveAvailability,
} from "@/lib/db";
import { CheckoutClient } from "@/components/CheckoutClient";
import { KovaFooter } from "@/components/KovaFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const result = getProductWithVendor(productId);

  if (!result) {
    return (
      <>
        <main id="main" className="storefront-main">
          <div className="container">
            <div
              className="empty-state"
              style={{ maxWidth: 560, marginInline: "auto" }}
            >
              <h1 className="display display--sm">Product not found</h1>
              <p>The product you&apos;re looking for could not be found.</p>
              <Link href="/" className="btn btn--brand btn--sm">
                Back to Showroom
              </Link>
            </div>
          </div>
        </main>
        <KovaFooter />
      </>
    );
  }

  const db = readDb();
  const avail = getEffectiveAvailability(db, result.product);

  return (
    <Suspense
      fallback={
        <div style={{ padding: "3rem", textAlign: "center" }}>
          Loading checkout...
        </div>
      }
    >
      <CheckoutClient
        product={result.product}
        vendor={result.vendor}
        effectiveAvailable={avail.available}
        effectiveRemaining={avail.remaining}
      />
    </Suspense>
  );
}
