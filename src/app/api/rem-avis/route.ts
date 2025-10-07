import { NextRequest, NextResponse } from "next/server";
import { removeAvis } from "@/lib/dbFunctions";
import logger from "../../../../services/logger";

export async function POST(req: NextRequest) {
  try {
    const { avisId } = await req.json();
    logger.info(`POST /api/rem-avis for avisId: ${avisId}`);

    const result = await removeAvis(avisId);
    logger.info(`Avis removed: ${avisId}`);

    return NextResponse.json(result);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    logger.error("Error in POST /api/rem-avis", e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
