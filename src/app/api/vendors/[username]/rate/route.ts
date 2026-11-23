import { NextResponse } from "next/server";
import { addVendorRating, getVendorByUsername, getVendorRatings } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const vendor = getVendorByUsername(username);
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found." }, { status: 404 });
  }
  const ratings = getVendorRatings(vendor.id);
  return NextResponse.json({
    rating: vendor.rating,
    ratingCount: vendor.ratingCount,
    ratings,
  });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const vendor = getVendorByUsername(username);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found." }, { status: 404 });
    }

    const body = await req.json();
    const stars = Number(body.stars);
    const reviewerName = String(body.reviewerName ?? "Verified Visitor").trim() || "Verified Visitor";
    const comment = String(body.comment ?? "").trim().slice(0, 500);

    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return NextResponse.json(
        { error: "Please select a star rating between 1 and 5." },
        { status: 400 }
      );
    }

    const result = addVendorRating({
      vendorId: vendor.id,
      stars,
      reviewerName,
      comment,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Unable to save rating." },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Invalid rating request." },
      { status: 400 }
    );
  }
}

