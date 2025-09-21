import { NextRequest, NextResponse } from "next/server";
import { deleteMaison } from "@/lib/dbFunctions";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const { maisonId } = await req.json();

    if (!maisonId || !Types.ObjectId.isValid(maisonId)) {
      return NextResponse.json(
        { message: "Invalid or missing maisonId" },
        { status: 400 }
      );
    }

    const maisonObjectId = new Types.ObjectId(maisonId);
    const result = await deleteMaison(maisonObjectId);

    if (!result) {
      return NextResponse.json(
        { message: "Maison not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Maison removed" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error removing maison:", error);
    return NextResponse.json(
      { message: "Error removing maison" },
      { status: 500 }
    );
  }
}
