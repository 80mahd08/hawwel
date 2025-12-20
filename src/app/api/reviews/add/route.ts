import { NextResponse } from "next/server";
import { createReview } from "@/lib/dbFunctions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { houseId, userId, rating, comment } = body;

    // Validate required fields
    if (!houseId || !userId || !rating || !comment) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await createReview({
      houseId,
      userId,
      rating,
      comment,
    });

    return NextResponse.json({ message: "Review added successfully", review }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}
