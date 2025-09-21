import { NextRequest, NextResponse } from "next/server";
import { getMaisonAvis } from "@/lib/dbFunctions";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const maisonId = req.nextUrl.searchParams.get("maisonId");
    if (!maisonId) return NextResponse.json([], { status: 200 });
    const avis = await getMaisonAvis(new Types.ObjectId(maisonId));
    return NextResponse.json(avis);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
