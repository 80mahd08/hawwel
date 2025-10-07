import { NextRequest, NextResponse } from "next/server";
import { getMaisonAvis } from "@/lib/dbFunctions";
import { Types } from "mongoose";
import logger from "../../../../services/logger";

export async function GET(req: NextRequest) {
  try {
    const maisonId = req.nextUrl.searchParams.get("maisonId");
    logger.info(`GET /api/get-avis for maisonId: ${maisonId}`);

    if (!maisonId) {
      logger.warn("No maisonId provided to /api/get-avis");
      return NextResponse.json([], { status: 200 });
    }

    const avis = await getMaisonAvis(new Types.ObjectId(maisonId));
    logger.info(`Fetched ${avis.length} avis for maisonId: ${maisonId}`);
    return NextResponse.json(avis);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    logger.error("Error in GET /api/get-avis", e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
