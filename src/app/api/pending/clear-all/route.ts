import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import { getUserByClerkId, clearAllNotifications } from "@/lib/dbFunctions";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mongoUser = await getUserByClerkId(user.id);
    if (!mongoUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await dbConnect();
    await clearAllNotifications(mongoUser._id.toString());

    return NextResponse.json(
      { ok: true, message: "All notifications cleared" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
