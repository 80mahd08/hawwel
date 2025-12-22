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

    // Send Email Notification to Owner
    try {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      const User = (await import("@/models/User")).default;
      const House = (await import("@/models/house")).default;
      const { sendEmail, getBookingRequestTemplate } = await import("@/lib/email");

      await dbConnect();
      const [owner, houseObj] = await Promise.all([
        User.findById(ownerId),
        House.findById(houseId)
      ]);

      if (owner?.email) {
        await sendEmail({
          to: owner.email,
          subject: "New Booking Request 🏠",
          html: getBookingRequestTemplate({
            ownerName: owner.name || "Owner",
            buyerName: mongoUser.name || "A traveler",
            houseTitle: houseObj?.title || "your property",
            startDate: new Date(startDate).toLocaleDateString(),
            endDate: new Date(endDate).toLocaleDateString(),
          }),
        });
      }
    } catch {
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { message: "Pending created", pending },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Internal error" },
      { status: 500 }
    );
  }
}
