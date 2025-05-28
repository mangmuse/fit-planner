import { getRoutineIds } from "@/app/api/_utils/getRoutines";
import { handleServerError } from "@/app/api/_utils/handleError";
import { prisma } from "@/lib/prisma";
import { validateData } from "@/util/validateData";
import { RoutineDetail } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const { userId } = await Promise.resolve(params);
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
