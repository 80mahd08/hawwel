import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Pending from "@/models/Pending";
import { getUserByClerkId, updatePendingStatus } from "@/lib/dbFunctions";
import User from "@/models/User";
import House from "@/models/house";
import { sendEmail, getStatusUpdateTemplate } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pendingId, houseId } = body || {};

    if (!pendingId || !houseId) {
      return NextResponse.json(
        { error: "pendingId and houseId are required" },
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

    await updatePendingStatus(pendingId, "approved");

    // ⚡ PERFORMANCE: Fire-and-forget email notification
    (async () => {
      try {
        await dbConnect();
        
        const [buyer, houseObj] = await Promise.all([
          User.findById(pending.buyerId).select("email name"),
          House.findById(houseId).select("title telephone")
        ]);

        if (buyer?.email) {
          await sendEmail({
            to: buyer.email,
            subject: "Booking Approved! 🎉",
            html: getStatusUpdateTemplate({
              userName: buyer.name || "Guest",
              houseTitle: houseObj?.title || "the property",
              status: "approved",
              startDate: new Date(pending.startDate).toLocaleDateString(),
              endDate: new Date(pending.endDate).toLocaleDateString(),
              telephone: houseObj?.telephone
            }),
          });
        }
      } catch (err) {
        console.error("Background Email Error (Accept):", err);
      }
    })();

    return NextResponse.json(
      { ok: true, message: "Pending accepted and reservation confirmed", pending },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Accept Pending Error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Internal error" },
      { status: 500 }
    );
  }
}
