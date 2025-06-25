import { getWorkouts } from "@/app/api/_utils/getWorkouts";
import { handleServerError } from "@/app/api/_utils/handleError";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId가 필요합니다" },
        { status: 400 }
      );
    }
    const workouts = await getWorkouts(userId);

    return NextResponse.json({ success: true, workouts }, { status: 200 });
  } catch (e) {
    return handleServerError(e);
  }
};
