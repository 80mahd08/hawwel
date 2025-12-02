import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Pending from "@/models/Pending";
import { getUserByClerkId, deletePending } from "@/lib/dbFunctions";

export async function POST(req: Request) {
  try {
    const { pendingId } = await req.json();

    if (!pendingId) {
      return NextResponse.json(
        { error: "pendingId is required" },
        { status: 400 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mongoUser = await getUserByClerkId(user.id);
    if (!mongoUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await dbConnect();

    const pending = await Pending.findById(pendingId);
    if (!pending) {
      return NextResponse.json({ error: "Pending not found" }, { status: 404 });
    }

    const userIdStr = mongoUser._id.toString();
    const buyerIdStr = String(pending.buyerId);
    const ownerIdStr = String(pending.ownerId);

    if (userIdStr !== buyerIdStr && userIdStr !== ownerIdStr) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deletePending(pendingId);

    return NextResponse.json(
      { ok: true, message: "Pending removed" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
