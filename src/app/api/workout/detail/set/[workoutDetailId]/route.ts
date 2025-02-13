import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workoutDetailId: string }> }
) {
  const { workoutDetailId } = await Promise.resolve(params);

  try {
    await prisma.workoutDetail.delete({
      where: { id: workoutDetailId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new NextResponse("세트 삭제에 실패했습니다", { status: 500 });
  }
}
