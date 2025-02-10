import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SyncChange } from "@/api/exercise.api";
import pMap from "p-map";

export async function POST(req: NextRequest) {
  console.log("hellooo");
  try {
    const body = await req.json();
    const unsynced = body.unsynced as SyncChange["payload"][];
    const userId = body.userId;
    console.log(unsynced);
    const updatedList: Array<{ localId: number; serverId: number }> = [];

    await pMap(
      unsynced,
      async (item) => {
        const localId = item.id ?? 0;
        let serverExerciseId = item.serverId;
        const isBookmarked = item.isBookmarked ?? false;
        console.log(serverExerciseId);

        let exercise = null;
        if (serverExerciseId) {
          exercise = await prisma.exercise.findUnique({
            where: { id: serverExerciseId },
          });
        }
        if (!exercise) {
          console.log(item.name, "이게 없을수가있어??");
          exercise = await prisma.exercise.create({
            data: {
              name: item.name ?? "unknown",
              category: item.category || "미지정",
              isCustom: true,
              imageUrl: item.imageUrl || "/",
              userId,
            },
          });
          serverExerciseId = exercise.id;
          updatedList.push({ localId, serverId: serverExerciseId });
        }

        if (userId && serverExerciseId) {
          console.log("hello");
          console.log("hellloooo");
          console.log(userId, serverExerciseId);
          await prisma.userExercise.upsert({
            where: {
              userId_exerciseId: {
                userId,
                exerciseId: serverExerciseId,
              },
            },
            update: { isBookmarked },
            create: {
              userId,
              exerciseId: serverExerciseId,
              isBookmarked,
            },
          });
        }
      },
      { concurrency: 5 }
    );

    return NextResponse.json({ updated: updatedList, success: true });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
