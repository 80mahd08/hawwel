import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Pending from "@/models/Pending";
import { getUserByClerkId, updatePendingStatus } from "@/lib/dbFunctions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pendingId } = body || {};

    if (!pendingId) {
      return NextResponse.json(
        { error: "pendingId is required" },
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

    const pending = await Pending.findById(pendingId);
    if (!pending)
      return NextResponse.json({ error: "Pending not found" }, { status: 404 });

    if (pending.ownerId.toString() !== mongoUser._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await updatePendingStatus(pendingId, "rejected");

    // Send Email Notification to Buyer
    try {
      const User = (await import("@/models/User")).default;
      const House = (await import("@/models/house")).default;
      const { sendEmail, getStatusUpdateTemplate } = await import("@/lib/email");

      const [buyer, houseObj] = await Promise.all([
        User.findById(pending.buyerId),
        House.findById(pending.houseId)
      ]);

      if (buyer?.email) {
        await sendEmail({
          to: buyer.email,
          subject: "Booking Update ℹ️",
          html: getStatusUpdateTemplate({
            userName: buyer.name || "Guest",
            houseTitle: houseObj?.title || "the property",
            status: "rejected",
            startDate: new Date(pending.startDate).toLocaleDateString(),
            endDate: new Date(pending.endDate).toLocaleDateString()
          }),
        });
      }
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    return NextResponse.json(
      { ok: true, message: "Pending rejected" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
