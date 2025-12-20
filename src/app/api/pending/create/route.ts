import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId, createPending } from "@/lib/dbFunctions";
import { ReservationSchema } from "@/lib/validations";
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate reservation logic
    const validatedData = ReservationSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid reservation data", errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { houseId, ownerId, startDate, endDate } = validatedData.data;

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
