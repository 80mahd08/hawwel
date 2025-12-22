import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import { getUserByClerkId } from "@/lib/dbFunctions";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const mongoUser = await getUserByClerkId(user.id);
    
    return NextResponse.json({ user: mongoUser });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
