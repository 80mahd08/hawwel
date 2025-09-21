import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId, createMaison } from "@/lib/dbFunctions";

export async function POST(req: NextRequest) {
  try {
    const { userId, maisonData } = await req.json();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user?.role !== "PROPRIETAIRE") {
      return NextResponse.json(
        { message: "You are not authorized to create a maison" },
        { status: 403 }
      );
    }

    const maison = await createMaison({
      ...maisonData,
      ownerId: user._id,
    });

    return NextResponse.json({ message: "success", maison }, { status: 200 });
  } catch (error) {
    console.error("❌ Error creating maison:", error);
    return NextResponse.json(
      { message: "Error creating maison" },
      { status: 500 }
    );
  }
}
