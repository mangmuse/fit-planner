import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ExerciseModel } from "@/types/models";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = decodeURIComponent(searchParams.get("keyword") ?? "");
  const type = decodeURIComponent(searchParams.get("type") ?? "전체");
  const category = decodeURIComponent(searchParams.get("category") ?? "전체");
  const userId = searchParams.get("userId") ?? undefined;

  const whereClause: Prisma.ExerciseWhereInput = {
    name: { contains: keyword, mode: "insensitive" },
  };

  if (type === "커스텀") {
    whereClause.isCustom = true;
  } else if (type === "즐겨찾기" && userId) {
    whereClause.userExercises = {
      some: {
        userId: userId,
        isBookmarked: true,
      },
    };
  }

  if (category !== "전체") {
    whereClause.category = category;
  }

  try {
    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: { id: "asc" },
      include: userId
        ? {
            userExercises: {
              where: { userId },
              select: { isBookmarked: true },
            },
          }
        : undefined,
    });

    const exercisesWithBookmark = exercises.map(
      (
        exercise: ExerciseModel & {
          userExercises?: { isBookmarked: boolean }[];
        }
      ) => {
        const isBookmarked = exercise.userExercises?.[0]?.isBookmarked ?? false;
        const { userExercises, ...rest } = exercise;
        return { ...rest, isBookmarked };
      }
    );

    return NextResponse.json(exercisesWithBookmark, { status: 200 });
  } catch (error) {
    console.error("[GET Exercises Error]", error);
    return NextResponse.json({ message: "서버 문제 에러" }, { status: 500 });
  }
}
