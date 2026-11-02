
import { searchPatientsAction } from "@/features/appointments/apis/patients.action";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const token = await getToken({ req });

  if (!token?.accessToken) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const result = await searchPatientsAction(
      query,
      token.accessToken,
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Failed to search patients" },
      { status: 500 },
    );
  }
}