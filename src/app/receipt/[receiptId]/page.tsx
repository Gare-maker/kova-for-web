import type { Metadata } from "next";
import Link from "next/link";
import { getReceiptByIdAndToken } from "@/lib/db";
import { ReceiptClient } from "@/components/ReceiptClient";
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

  const receipt = getReceiptByIdAndToken(receiptId, token);

  if (!receipt) {
    return (
      <>
        <main id="main" className="storefront-main">
          <div className="container">
            <div
              className="empty-state"
              style={{ maxWidth: 560, marginInline: "auto" }}
            >
              <h1 className="display display--sm">Receipt unavailable</h1>
              <p>
                We couldn&apos;t retrieve your receipt link. Check the receipt
                copy sent to your email address or return to the showroom.
              </p>
              <Link href="/" className="btn btn--brand btn--sm">
                Return to Showroom
              </Link>
            </div>
          </div>
        </main>
        <KovaFooter />
      </>
    );
  }

  return <ReceiptClient receipt={receipt} />;
}
