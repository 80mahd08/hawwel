import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
    }

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(50);

    return NextResponse.json({ messages });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
