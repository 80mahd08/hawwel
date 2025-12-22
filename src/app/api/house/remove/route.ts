import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import House from "@/models/house";
import Pending from "@/models/Pending";
import { getUserByClerkId } from "@/lib/dbFunctions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { houseId } = body || {};

    if (!houseId) {
      return NextResponse.json(
        { error: "houseId is required" },
        { status: 400 }
      );
    }

    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const mongoUser = await getUserByClerkId(user.id);
    if (!mongoUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    await dbConnect();

    const house = await House.findById(houseId);
    if (!house)
      return NextResponse.json({ error: "House not found" }, { status: 404 });

    if (house.ownerId.toString() !== mongoUser._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // remove pendings related to this house
    await Pending.deleteMany({ houseId });

    // remove the house
    await House.findByIdAndDelete(houseId);

    return NextResponse.json(
      { ok: true, message: "House removed" },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal error" },
      { status: 500 }
    );
  }
}
