import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const newSet = await req.json();
  if (!newSet) {
    return NextResponse.json(
      { error: "세트 추가에 실패했습니다" },
      { status: 400 }
    );
  }
  await prisma.workoutDetail.create({ data: newSet });
  return NextResponse.json({ success: true });
}
