import { getRoutineIds } from "@/app/api/_utils/getRoutines";
import { handleServerError } from "@/app/api/_utils/handleError";
import { prisma } from "@/lib/prisma";
import { validateData } from "@/util/validateData";
import { Prisma, RoutineDetail } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export type RoutineDetailWithIncludes = Prisma.RoutineDetailGetPayload<{
  include: {
    exercise: {
      select: {
        name: true;
      };
    };
  };
}>;

export const GET = async (req: NextRequest) => {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "userId가 없거나 타입이 올바르지 않습니다",
        },
        { status: 400 }
      );
    }

    const parsedUserId = validateData<string>(z.string(), userId);
    const routineIds = await getRoutineIds(parsedUserId);
    const routineDetails = await prisma.routineDetail.findMany({
      where: {
        routineId: {
          in: routineIds,
        },
      },
      include: {
        exercise: {
          select: {
            name: true,
          },
        },
      },
    });
    const transformedDetails: RoutineDetail[] = routineDetails.map((detail) => {
      const { exercise, ...rest } = detail;
      return { ...rest, exerciseName: exercise.name };
    });
    return NextResponse.json({
      success: true,
      routineDetails: transformedDetails,
    });
  } catch (e) {
    return handleServerError(e);
  }
};
