import { getRoutines } from "@/app/api/_utils/getRoutines";
import { handleServerError } from "@/app/api/_utils/handleError";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (req: NextRequest) => {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "userId가 없거나 타입이 올바르지 않습니다",
        },
        { status: 400 }
      );
    }
    const parsedUserId = validateData<string>(z.string(), userId);
    const routines = await getRoutines(parsedUserId);

    return NextResponse.json({ success: true, routines }, { status: 200 });
  } catch (e) {
    return handleServerError(e);
  }
};
