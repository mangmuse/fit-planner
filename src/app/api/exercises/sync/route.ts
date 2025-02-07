import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SyncChange } from "@/api/exercise";


 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const changes: SyncChange[] = body.changes;

    const updatedList: {
      id: number;
      serverId: number;
      isBookmarked: boolean;
    }[] = [];

    for (const change of changes) {
      switch (change.type) {
        /* ======================
         * 1) 새 운동 추가 + 북마크
         * ====================== */
        case "addExercise": {
          // payload = { localId, userId, name, category, isBookmarked, ...}

          // 1) 새 Exercise 레코드 만들기 (커스텀 운동)
          const newExercise = await prisma.exercise.create({
            data: {
              name: change.payload.name ?? "이름미지정",
              category: change.payload.category ?? "전체",
              imageUrl: change.payload.imageUrl ?? "/",
              isCustom: true,
              userId: change.payload.userId,
              createdAt: change.payload.createdAt,
              updatedAt: change.payload.updatedAt,
            },
          });

          // 2) 북마크 true면 userExercise upsert
          const isBookmarked = change.payload.isBookmarked ?? false;
          if (isBookmarked) {
            await prisma.userExercise.upsert({
              where: {
                userId_exerciseId: {
                  userId: change.payload.userId!,
                  exerciseId: newExercise.id,
                },
              },
              update: { isBookmarked: true },
              create: {
                userId: change.payload.userId!,
                exerciseId: newExercise.id,
                isBookmarked: true,
              },
            });
          }

          updatedList.push({
            id: change.payload.id ?? 0,
            serverId: newExercise.id,
            isBookmarked, // 최종적으로 DB에 반영된 값
          });
          break;
        }

        /* ======================
         * 2) 기존 운동 북마크만 업데이트
         * ====================== */
        case "updateBookmark": {
          // payload = { localId, userId, serverId, isBookmarked }
          // 여기서 serverId, userId 모두 있어야 정확히 upsert 가능
          const isBm = change.payload.isBookmarked ?? false;

          // 만약 c.payload.serverId가 undefined라면,
          // -> 실제 DB에서 localId -> serverId 매핑을 찾는 별도 장치가 필요하지만,
          //   여기선 단순히 'serverId'를 payload로 보내준다고 가정
          const serverExerciseId = change.payload.serverId;
          const userId = change.payload.userId;

          if (!serverExerciseId || !userId) {
            // 로직 미비 → 동기화 실패 처리 or skip
            // ex) throw new Error("Missing serverId / userId in updateBookmark");
            updatedList.push({
              id: change.payload.id ?? 0,
              serverId: 0,
              isBookmarked: isBm,
            });
            break;
          }

          // userExercise upsert
          await prisma.userExercise.upsert({
            where: {
              userId_exerciseId: {
                userId,
                exerciseId: serverExerciseId,
              },
            },
            update: { isBookmarked: isBm },
            create: {
              userId,
              exerciseId: serverExerciseId,
              isBookmarked: isBm,
            },
          });

          updatedList.push({
            id: change.payload.id ?? 0,
            serverId: serverExerciseId,
            isBookmarked: isBm,
          });
          break;
        }

        default:
          break;
      }
    }

    return NextResponse.json({ success: true, updated: updatedList });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
