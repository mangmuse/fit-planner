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
            fixedExerciseMemo: {
              select: {
                content: true,
                updatedAt: true,
                createdAt: true,
              },
            },
            dailyExerciseMemos: {
              select: {
                content: true,
                date: true,
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
      const { userExercises, ...rest } = exercise;

      return {
        ...rest,
        isBookmarked: userExercise?.isBookmarked ?? false,
        unit: userExercise?.unit ?? "kg",
        exerciseMemo: userExercise
          ? {
              fixed: userExercise.fixedExerciseMemo || null,
              daily: userExercise.dailyExerciseMemos || [],
            }
          : null,
      };
    });

    return NextResponse.json(
      { success: true, exercises: exercisesWithBookmark },
      { status: 200 }
    );
  } catch (e) {
    return handleServerError(e);
  }
}
