import { getWorkouts } from "@/app/api/_utils/getWorkouts";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const { userId } = await Promise.resolve(params);
    if (!userId) throw new Error("userId가 전달되지 않았습니다.");
    const workouts = await getWorkouts(userId);
    console.log(
      workouts.map((w) => console.log(typeof w.date, "<<<<<<<<<<<,이거임 ㅋㅋ"))
    );
    return NextResponse.json({ success: true, workouts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
};
