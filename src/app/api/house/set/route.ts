import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId, createHouse } from "@/lib/dbFunctions";

export async function POST(req: NextRequest) {
  try {
    const { userId, houseData } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role !== "OWNER") {
      return NextResponse.json(
        { message: "You are not authorized to create a house" },
        { status: 403 }
      );
    }

    const house = await createHouse({
      ...houseData,
      ownerId: user._id,
    });

    return NextResponse.json({ message: "success", house }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Error creating house" },
      { status: 500 }
    );
  }
}
