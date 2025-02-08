import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; date: string }> }
) {
  const { userId, date } = await Promise.resolve(params);
  const parsedDate = new Date(date);
  const workout = await prisma.workout.findFirst({
    where: { userId, date: parsedDate },
  });

  if (!workout) {
    return NextResponse.json([], { status: 200 });
  }

  const workoutDetails = await prisma.workoutDetail.findMany({
    where: { workoutId: workout.id },
    orderBy: [{ exerciseOrder: "asc" }, { setOrder: "asc" }],
    include: {
      exercise: {
        select: {
          name: true,
        },
      },
    },
  });

  const flattenedWorkoutDetails = workoutDetails.map((detail) => ({
    ...detail,
    exerciseName: detail.exercise.name,
    exercise: undefined,
  }));
  console.log(flattenedWorkoutDetails);
  return NextResponse.json(flattenedWorkoutDetails, { status: 200 });
}
