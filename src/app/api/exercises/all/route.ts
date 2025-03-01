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
          select: { isBookmarked: true, unit: true },
        },
      },
    });

    const exercisesWithBookmark = exercises.map((exercise) => {
      const isBookmarked = parsedUserId
        ? exercise.userExercises?.[0]?.isBookmarked ?? false
        : false;
      const unit = exercise.userExercises[0].unit;
      const { userExercises, ...rest } = exercise;
      return { ...rest, isBookmarked, unit };
    });
    return NextResponse.json(
      { success: true, exercises: exercisesWithBookmark },
      { status: 200 }
    );
  } catch (e) {
    return handleServerError(e);
  }
}
