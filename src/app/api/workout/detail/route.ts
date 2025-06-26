import { convertDatesToStrings } from "@/app/api/_utils/dateConverter";
import { getWorkoutIds } from "@/app/api/_utils/getWorkouts";
import { handleServerError } from "@/app/api/_utils/handleError";
import { prisma } from "@/lib/prisma";
import { ClientWorkoutDetail } from "@/types/models";
import { validateData } from "@/util/validateData";
import { WorkoutDetail, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export type WorkoutDetailWithIncludes = Prisma.WorkoutDetailGetPayload<{
  include: {
    exercise: {
      select: {
        name: true;
      };
    };
  };
}>;
export const GET = async (req: NextRequest) => {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, message: "userId가 없거나 타입이 올바르지 않습니다" },
        { status: 400 }
      );
    }
    const parsedUserId = validateData<string>(z.string(), userId);
    const workoutIds = await getWorkoutIds(parsedUserId);
    if (workoutIds.length === 0) {
      return NextResponse.json({ success: true, workoutDetails: [] });
    }
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
    const transformedDetails: ClientWorkoutDetail[] = workoutDetails.map(
      (detail: WorkoutDetailWithIncludes) => {
        const { exercise, ...rest } = detail;
        return {
          ...rest,
          exerciseName: exercise.name,
          createdAt: rest.createdAt.toISOString(),
          updatedAt: rest.updatedAt?.toISOString(),
        } as ClientWorkoutDetail;
      }
    );
    return NextResponse.json({
      success: true,
      workoutDetails: transformedDetails,
    });
  } catch (e) {
    return handleServerError(e);
  }
};

export async function POST(req: NextRequest) {
  const { userId, selectedExercises, date } = await req.json();

  let workout = await prisma.workout.findFirst({
    where: {
      userId,
      date: new Date(date),
    },
  });

  let startOrder = 1;

  if (!workout) {
    workout = await prisma.workout.create({
      data: { userId, date: new Date(date) },
    });
  } else {
    const lastDetail = await prisma.workoutDetail.findFirst({
      where: { workoutId: workout.id },
      orderBy: { exerciseOrder: "desc" },
    });
    startOrder = lastDetail ? lastDetail.exerciseOrder + 1 : 1;
  }

  const details = selectedExercises.map(
    (exerciseId: number, index: number) => ({
      workoutId: workout.id,
      exerciseId,
      exerciseOrder: startOrder + index,
      setOrder: 1,
    })
  );

  await prisma.workoutDetail.createMany({
    data: details,
  });

  return Response.json({ success: true });
}
