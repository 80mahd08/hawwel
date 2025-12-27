import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId, createPending } from "@/lib/dbFunctions";
import { ReservationSchema } from "@/lib/validations";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import House from "@/models/house";
import { sendEmail, getBookingRequestTemplate } from "@/lib/email";

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

    // ⚡ PERFORMANCE FOCUSED: SEND RESPONSE FIRST, EMAIL LATER
    // We launch the email logic as a "fire-and-forget" background task.
    // This ensures the UI gets an immediate success response.
    (async () => {
      try {
        await dbConnect();
        
        // Fetch only what we need in parallel
        const [owner, houseObj] = await Promise.all([
          User.findById(ownerId).select("email name"),
          House.findById(houseId).select("title")
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
      } catch (backgroundError) {
        // Log error silently so it doesn't crash the server, 
        // but we might want to log this to a monitoring service in production.
        console.error("Background Email Error:", backgroundError);
      }
    })();

    return NextResponse.json(
      { message: "Pending created", pending },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create Pending Error:", error);
    return NextResponse.json(
      { message: (error as Error)?.message || "Internal error" },
      { status: 500 }
    );
  }
}
