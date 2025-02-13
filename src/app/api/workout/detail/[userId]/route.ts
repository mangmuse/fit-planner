import { getWorkoutIds, getWorkouts } from "@/app/api/_utils/getWorkouts";
import { handleServerError } from "@/app/api/_utils/handleError";
import { prisma } from "@/lib/prisma";
import { validateData } from "@/util/validateData";
import { WorkoutDetail } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const { userId } = await Promise.resolve(params);
    const parsedUserId = validateData<string>(z.string(), userId);
    const workoutIds = await getWorkoutIds(parsedUserId);
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
    const transformedDetails: WorkoutDetail[] = workoutDetails.map((detail) => {
      const { exercise, ...rest } = detail;
      return { ...rest, exerciseName: exercise.name };
    });
    return NextResponse.json({
      success: true,
      workoutDetails: transformedDetails,
    });
  } catch (e) {
    return handleServerError(e);
  }
};
