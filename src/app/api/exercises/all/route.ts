import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PatchBookmarkInput } from "@/types/dto/exercise.dto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = decodeURIComponent(searchParams.get("keyword") || "");
  const type = decodeURIComponent(searchParams.get("type") || "전체");
  const category = decodeURIComponent(searchParams.get("category") || "전체");

  console.log(`[${keyword}, ${type}, ${category}]`);
  const whereClause: Prisma.ExerciseWhereInput = {
    name: {
      contains: keyword,
      mode: "insensitive",
    },
  };

  if (type === "커스텀") {
    whereClause.isCustom = true;
  } else if (type === "즐겨찾기") {
    whereClause.isBookmarked = true;
  }

  if (category !== "전체") {
    whereClause.category = category;
  }

  try {
    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(exercises, { status: 200 });
  } catch (error) {
    console.error("[GET Exercises Error]", error);
    return NextResponse.json({ message: "서버 문제 에러" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  console.log("hellooworld");
  const { exerciseId, isBookmarked }: PatchBookmarkInput = await req.json();
  console.log(exerciseId, isBookmarked);
  try {
    const found = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });
    if (!found) {
      return NextResponse.json(
        { success: false, message: "해당 운동을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const updated = await prisma.exercise.update({
      where: { id: exerciseId },
      data: { isBookmarked: !isBookmarked },
    });

    return NextResponse.json(
      { success: true, exercise: updated },
      { status: 200 }
    );
  } catch (e) {
    console.error("북마크 업데이트에 실패했습니다.", e);
    return NextResponse.json(
      { success: false, message: "서버 문제 에러" },
      { status: 500 }
    );
  }
}
