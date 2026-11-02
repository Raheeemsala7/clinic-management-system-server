import { searchPatientsAction } from "@/features/patient/apis/patient.api";
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
      { message: "Unauthorized", code: 401, status: false },
      { status: 401 },
    );
  }

  try {
    const result = await searchPatientsAction(
      query,
      token.accessToken,
    );

    // إذا انتهت صلاحية التوكين في السيرفر نرجع HTTP Status 401
    if (result && typeof result === "object" && "code" in result && result.code === 401) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Failed to search patients", status: false },
      { status: 500 },
    );
  }
}
