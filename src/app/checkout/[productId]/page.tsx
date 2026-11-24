import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  getProductWithVendor,
  getUserById,
  readDb,
  getEffectiveAvailability,
} from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/session";
import { CheckoutClient } from "@/components/CheckoutClient";
import { KovaHeader } from "@/components/KovaHeader";
import { KovaFooter } from "@/components/KovaFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ type?: string; qty?: string; feeType?: string; verify?: string }>;
}) {
  const { productId } = await params;
  const sp = await searchParams;

  // Authentication Gate: unauthenticated users must register / sign in as Buyer first
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    const qs = new URLSearchParams();
    if (sp.type) qs.set("type", sp.type);
    if (sp.qty) qs.set("qty", sp.qty);
    if (sp.feeType) qs.set("feeType", sp.feeType);
    const nextPath = `/checkout/${productId}${qs.toString() ? `?${qs.toString()}` : ""}`;
    redirect(`/register?next=${encodeURIComponent(nextPath)}`);
  }

  const user = getUserById(userId);
  const result = getProductWithVendor(productId);

  if (!result) {
    return (
      <>
        <KovaHeader />
        <main id="main" className="storefront-main">
          <div className="container">
            <div
              className="empty-state"
              style={{ maxWidth: 560, marginInline: "auto" }}
            >
              <h1 className="display display--sm">Product not found</h1>
              <p>The product you&apos;re looking for could not be found.</p>
              <Link href="/" className="btn btn--brand btn--sm">
                Back to Storefront
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
        initialBuyer={
          user
            ? { name: user.name, phone: user.phone, email: user.email }
            : null
        }
      />
    </Suspense>
  );
}
