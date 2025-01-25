import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
    });

    return NextResponse.json(exercises, { status: 200 });
  } catch (error) {
    console.error("[GET Exercises Error]", error);
    return NextResponse.json({ message: "서버 문제 에러" }, { status: 500 });
  }
}
