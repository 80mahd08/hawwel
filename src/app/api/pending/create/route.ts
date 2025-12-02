import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId, createPending } from "@/lib/dbFunctions";
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const houseId = body?.houseId;
    const ownerId = body?.ownerId;

    const startDate = body?.startDate ? new Date(body.startDate) : null;
    const endDate = body?.endDate ? new Date(body.endDate) : null;

    if (!houseId || !startDate || !endDate) {
      return NextResponse.json(
        { message: "houseId, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { message: "Start date must be before end date" },
        { status: 400 }
      );
    }

    const mongoUser = await getUserByClerkId(user.id);
    if (!mongoUser) {
      return NextResponse.json(
        { message: "User not found in database" },
        { status: 404 }
      );
    }

    const pending = await createPending({
      buyerId: mongoUser._id.toString(),
      ownerId,
      houseId,
      startDate,
      endDate,
    });

    return NextResponse.json(
      { message: "Pending created", pending },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
