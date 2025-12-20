import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId, createHouse } from "@/lib/dbFunctions";
import { HouseSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const { userId, houseData } = await req.json();

    // Validate house logic
    const validatedData = HouseSchema.safeParse(houseData);
    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid house data", errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

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
      ...validatedData.data,
      ownerId: user._id,
      location_geo: {
        type: "Point",
        coordinates: [validatedData.data.lng, validatedData.data.lat],
      },
    } as any);

    return NextResponse.json({ message: "success", house }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Error creating house" },
      { status: 500 }
    );
  }
}
