import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { validateData } from "@/util/validateData";
import { z } from "zod";
import { handleServerError } from "@/app/api/_utils/handleError";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? undefined;
  const parsedUserId = validateData<string>(z.string(), userId);

  try {
    const exercises = await prisma.exercise.findMany({
      include: {
        userExercises: {
          where: { userId: parsedUserId },
          select: {
            isBookmarked: true,
            unit: true,
            exerciseMemo: {
              select: {
                content: true,
                updatedAt: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
    exercises.forEach((e) => console.log(e.userExercises[0]));

    const exercisesWithBookmark = exercises.map((exercise) => {
      const userExercise = exercise.userExercises[0];
      const isBookmarked = parsedUserId
        ? userExercise.isBookmarked ?? false
        : false;
      const unit = userExercise.unit;
      const { userExercises, ...rest } = exercise;
      return {
        ...rest,
        isBookmarked,
        unit,
        exerciseMemo: userExercise.exerciseMemo,
      };
    });
    console.log(
      exercisesWithBookmark,
      "exercisesWithBookmarkexercisesWithBookmark"
    );
    return NextResponse.json(
      { success: true, exercises: exercisesWithBookmark },
      { status: 200 }
    );
  } catch (e) {
    return handleServerError(e);
  }
}
