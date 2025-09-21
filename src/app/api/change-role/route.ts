import { NextRequest, NextResponse } from "next/server";
import { updateRoleToProprietaire } from "@/lib/dbFunctions";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const user = await updateRoleToProprietaire(userId);
    return NextResponse.json(
      { message: "Role updated to proprietaire", user: user },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating role:", error);
    return NextResponse.json(
      { message: "Error updating role" },
      { status: 500 }
    );
  }
}
