import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import { getUserByClerkId } from "@/lib/dbFunctions";

export async function POST(req: Request) {
  try {
    const { conversationId } = await req.json();
    const user = await currentUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const mongoUser = await getUserByClerkId(user.id);
    if (!mongoUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await dbConnect();

    // Remove user from unreadBy array
    await Conversation.findByIdAndUpdate(conversationId, {
      $pull: { unreadBy: mongoUser._id }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
