import { NextResponse } from "next/server";
import {
  getProductWithVendor,
  readDb,
  getEffectiveAvailability,
} from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const result = getProductWithVendor(id);
  if (!result) {
    return NextResponse.json(
      { error: "The product you're looking for could not be found." },
      { status: 404 }
    );
  }

  const db = readDb();
  const avail = getEffectiveAvailability(db, result.product);

  return NextResponse.json({
    product: {
      ...result.product,
      effectiveAvailable: avail.available,
      effectiveRemaining: avail.remaining,
      unavailableReason: avail.reason ?? null,
    },
    vendor: result.vendor,
  });
}
