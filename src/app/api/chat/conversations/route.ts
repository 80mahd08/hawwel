import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Conversation from "@/models/Conversation";
import { getUserByClerkId } from "@/lib/dbFunctions";

export async function POST(req: Request) {
  try {
    const { participantId } = await req.json();
    const user = await currentUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const mongoUser = await getUserByClerkId(user.id);
    if (!mongoUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await dbConnect();

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [mongoUser._id, participantId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [mongoUser._id, participantId],
      });
    }

    return NextResponse.json({ conversationId: conversation._id });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const mongoUser = await getUserByClerkId(user.id);
    if (!mongoUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await dbConnect();

    const conversations = await Conversation.find({
      participants: mongoUser._id,
    })
      .populate("participants", "name imageUrl clerkId")
      .sort({ updatedAt: -1 });

    return NextResponse.json({ conversations });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
