import { NextRequest, NextResponse } from "next/server";
import { removeAvis } from "@/lib/dbFunctions";

export async function POST(req: NextRequest) {
  try {
    const { avisId } = await req.json();
    const result = await removeAvis(avisId);
    return NextResponse.json(result);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
