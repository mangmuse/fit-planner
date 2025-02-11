import { getWorkouts } from "@/app/api/_utils/getWorkouts";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const { userId } = await Promise.resolve(params);
    const parsedUserId = validateData<string>(z.string(), userId);
    const workouts = await getWorkouts(parsedUserId);

    return NextResponse.json({ success: true, workouts }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
};
