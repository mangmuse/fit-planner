import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, exerciseId, isBookmarked } = body;
    console.log(body);

    if (!exerciseId || !userId) {
      return NextResponse.json(
        { error: "userId 또는 exerciseId가 없습니다." },
        { status: 400 }
      );
    }

    const existingBookmark = await prisma.userExercise.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
    });

    const updatedBookmark = await prisma.userExercise.upsert({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
      create: {
        userId,
        exerciseId,
        isBookmarked: true,
      },
      update: {
        isBookmarked: !existingBookmark?.isBookmarked,
      },
    });

    return NextResponse.json(updatedBookmark);
  } catch (error) {
    console.error("북마크 업데이트에 실패했습니다", error);
    return NextResponse.json(
      { error: "북마크 업데이트에 실패했습니다" },
      { status: 500 }
    );
  }
}
