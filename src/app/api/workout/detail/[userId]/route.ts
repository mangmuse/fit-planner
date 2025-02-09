import { getWorkoutIds, getWorkouts } from "@/app/api/_utils/getWorkouts";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const { userId } = await Promise.resolve(params);
    if (!userId) throw new Error("userId가 존재하지않습니다");
    const workoutIds = await getWorkoutIds(userId);
    const workoutDetails = await prisma.workoutDetail.findMany({
      where: {
        workoutId: {
          in: workoutIds,
        },
      },
      include: {
        exercise: {
          select: {
            name: true,
          },
        },
      },
    });
    console.log(workoutDetails);
    const transformedDetails = workoutDetails.map((detail) => {
      const { exercise, ...rest } = detail;
      return { ...rest, exerciseName: exercise.name };
    });
    return NextResponse.json({
      success: true,
      workoutDetails: transformedDetails,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
};
