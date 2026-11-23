import { Suspense } from "react";
import {
  getVendorByUsername,
  getVendorProducts,
  readDb,
  getEffectiveAvailability,
} from "@/lib/db";
import { StorefrontClient } from "@/components/StorefrontClient";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const vendor = getVendorByUsername("MichealH");
  if (!vendor) {
    return null;
  }

  const db = readDb();
  const products = getVendorProducts(vendor.id).map((p) => {
    const avail = getEffectiveAvailability(db, p);
    return {
      ...p,
      effectiveAvailable: avail.available,
      effectiveRemaining: avail.remaining,
    };
  });

  return (
    <Suspense
      fallback={
        <div style={{ padding: "3rem", textAlign: "center" }}>
          Loading storefront...
        </div>
      }
    >
      <StorefrontClient vendor={vendor} products={products} basePath="/" />
    </Suspense>
  );
}
