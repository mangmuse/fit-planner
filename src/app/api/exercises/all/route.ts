import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateData } from "@/util/validateData";
import { z } from "zod";
import { handleServerError } from "@/app/api/_utils/handleError";
import { ClientExercise, clientExerciseSchema } from "@/types/models";
import { convertDatesToStrings } from "@/app/api/_utils/dateConverter";
import { Prisma } from "@prisma/client";

const getExerciseQueryArgs = (userId: string) => {
  return {
    include: {
      userExercises: {
        where: { userId },
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
  } as const;
};

type ExerciseQueryArgs = ReturnType<typeof getExerciseQueryArgs>;
export type ExerciseWithIncludes = Prisma.ExerciseGetPayload<ExerciseQueryArgs>;

function transformExerciseToClient(
  exercise: ExerciseWithIncludes
): ClientExercise {
  const userExercise = exercise.userExercises[0];
  const { userExercises, ...rest } = exercise;

  const transformed = convertDatesToStrings({
    ...rest,
    isBookmarked: userExercise?.isBookmarked ?? false,
    unit: userExercise?.unit ?? "kg",
    exerciseMemo: userExercise
      ? {
          fixed: userExercise.fixedExerciseMemo || null,
          daily: userExercise.dailyExerciseMemos || [],
        }
      : null,
  });

  return clientExerciseSchema.parse(transformed);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId || typeof userId !== "string") {
    return NextResponse.json(
      { success: false, message: "userId 파라미터가 없습니다" },
      { status: 400 }
    );
  }
  const parsedUserId = validateData<string>(z.string(), userId);

  try {
    const exercises = await prisma.exercise.findMany({
      where: {
        OR: [
          { userId: null }, // 시스템 제공
          { userId: parsedUserId }, // 커스텀
        ],
      },
      ...getExerciseQueryArgs(parsedUserId),
    });

    const exercisesWithBookmark = exercises.map(transformExerciseToClient);

    return NextResponse.json(
      {
        success: true,
        exercises: exercisesWithBookmark,
      },
      { status: 200 }
    );
  } catch (e) {
    return handleServerError(e);
  }
}
