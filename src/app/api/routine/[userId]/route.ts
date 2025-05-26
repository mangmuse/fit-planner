import { getRoutines } from "@/app/api/_utils/getRoutines";
import { handleServerError } from "@/app/api/_utils/handleError";
import { validateData } from "@/util/validateData";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const { userId } = await Promise.resolve(params);
    const parsedUserId = validateData<string>(z.string(), userId);
    const routines = await getRoutines(parsedUserId);

    return NextResponse.json({ success: true, routines }, { status: 200 });
  } catch (e) {
    return handleServerError(e);
  }
};
