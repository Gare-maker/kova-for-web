import type { Metadata } from "next";
import Link from "next/link";
import { getReceiptByIdAndToken } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/session";
import { ReceiptClient } from "@/components/ReceiptClient";
import { KovaHeader } from "@/components/KovaHeader";
import { KovaFooter } from "@/components/KovaFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Receipt",
  robots: { index: false, follow: false },
};

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ receiptId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { receiptId } = await params;
  const { token } = await searchParams;
  const sessionUserId = await getAuthenticatedUserId();

  const receipt = getReceiptByIdAndToken(receiptId, token, sessionUserId);

  if (!receipt) {
    return (
      <>
        <KovaHeader />
        <main id="main" className="storefront-main">
          <div className="container">
            <div
              className="empty-state"
              style={{ maxWidth: 560, marginInline: "auto" }}
            >
              <h1 className="display display--sm">Receipt unavailable</h1>
              <p>We couldn&apos;t retrieve your receipt. Please try again.</p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/account/receipts" className="btn btn--brand btn--sm">
                  Sign in to Receipt History
                </Link>
                <Link href="/" className="btn btn--outline btn--sm">
                  Return to Kova Showroom
                </Link>
              </div>
            </div>
          </div>
        </main>
        <KovaFooter />
      </>
    );
  }

  return <ReceiptClient receipt={receipt} />;
}
